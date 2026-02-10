'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'
import type { Ordem } from '../../(pages)/ordens/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function OrdemServicoRealtime() {
  const [ordens, setOrdens] = useState<Ordem[]>([])

  
  // ✅ 1) Carrega um snapshot inicial (pra UPDATE começar a fazer sentido)
  useEffect(() => {
    let cancelado = false

    async function carregarInicial() {
      const { data, error } = await supabase
        .from('ordemservico')
        .select('*')
        .eq('is_deleted', false)
        .order('id', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Erro ao buscar ordens:', error)
        return
      }
      if (!cancelado) setOrdens((data as Ordem[]) ?? [])
    }

    void carregarInicial()
    return () => {
      cancelado = true
    }
  }, [])

  // ✅ 2) Realtime com UPSERT no state (UPDATE também “entra” se não existir)
  useEffect(() => {
    const canalOs = supabase
      .channel('realtime:ordemservico')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ordemservico' },
        async (payload) => {
          console.log('[REALTIME]', payload.eventType, payload)

          const tipo = payload.eventType

          if (tipo === 'INSERT' || tipo === 'UPDATE') {
            const partial = payload.new as Ordem
            if (!partial.id) return
            
            // Fix: busca dados completos para ter joins
            try {
               const { data } = await axios.get<{ items: Ordem[] }>('/api/ordens/root', {
                 params: {
                   q: String(partial.id),
                   limit: 1
                 }
               })
               
               const incoming = data.items.find(o => o.id === partial.id)
               if (!incoming) {
                  // check soft delete in partial
                  if ((partial as any).is_deleted) {
                    setOrdens((atual) => atual.filter(o => o.id !== partial.id))
                  }
                  return
               }

               // soft delete
               if ((incoming as any).is_deleted) {
                 setOrdens((atual) => atual.filter((o) => o.id !== incoming.id))
                 return
               }
   
               setOrdens((atual) => {
                 const idx = atual.findIndex((o) => o.id === incoming.id)
                 if (idx === -1) return [incoming, ...atual] // ✅ entra no array
                 const copia = [...atual]
                 copia[idx] = incoming
                 return copia
               })

            } catch(e) {
               console.error('Erro fetch realtime OrdemRealTime', e)
            }

            return
          }

          if (tipo === 'DELETE') {
            const antigo = payload.old as Partial<Ordem>
            if (antigo?.id == null) return
            setOrdens((atual) => atual.filter((o) => o.id !== antigo.id))
          }
        }
      )
      .subscribe((status) => {
        console.log('STATUS:', status) // SUBSCRIBED / CLOSED / CHANNEL_ERROR ...
      })

    return () => {
      supabase.removeChannel(canalOs)
    }
  }, [])

  return (
    <div>
      <h2>Ordens em tela: {ordens.length}</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(ordens.slice(0, 5), null, 2)}
      </pre>
    </div>
  )
}
