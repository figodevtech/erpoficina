"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Upload,
  
} from "lucide-react";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { Veiculo, Veiculo_tipos } from "../types";

interface RegisterContentProps {
  veiculoId?: number
}

export default function EditContent({
 veiculoId,
}: RegisterContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | undefined>(undefined)

  const handleInputChange = (field: keyof Veiculo, value: string) => {
    setSelectedVeiculo({ ...selectedVeiculo, [field]: value });
  };


 const handleGetVeiculo = async () => {
    setIsLoading(true)
    try {
        const response = await axios.get(`/api/veiculos/${veiculoId}`)
        if(response.status === 200){
            setSelectedVeiculo(response.data)
        }
    } catch (error) {
        if(isAxiosError(error)){
            toast("Erro: ", {description: error.response?.data.error})
        }
    }finally{
        setIsLoading(false)
    }
 }
  return (
    // <DialogContent className="h-dvh sm:max-w-[1100px] w-[95vw] p-2 overflow-hidden">
    <DialogContent className="h-svh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
      <div className="flex h-full min-h-0 flex-col">
        <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
          <DialogTitle>Veículo ID #{selectedVeiculo?.id}</DialogTitle>
          <DialogDescription>
            Preencha dados para editar o veículo
          </DialogDescription>
        </DialogHeader>

        {/* CONTEÚDO DA ABA: o scroll fica no wrapper interno */}

        <div className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
          {/* Foto do Cliente */}
         
  
          <div className="space-y-2">
            <Label htmlFor="tipopessoa" className="text-sm sm:text-base">
              Tipo de Pessoa *
            </Label>
            <Select
              value={selectedVeiculo?.tipo || ""}
              onValueChange={(value: Veiculo_tipos) =>
                handleInputChange("tipo", value)
              }
            >
              <SelectTrigger className="h-10 sm:h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(Veiculo_tipos).map((tipo, i)=>(
                  <SelectItem key={i} value={tipo}></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dados Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpfcnpj" className="text-sm sm:text-base">
                Placa
              </Label>
              
                <Input
                  id="placa"
                  className=""
                  
                  onChange={(e) => {
                    handleInputChange("placa", e.target.value);
                  }}
                  
                  maxLength={7}
                />
             
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomerazaosocial" className="text-sm sm:text-base">
                Modelo
              </Label>
              <Input
                id="nomerazaosocial"
                className=""
                value={selectedVeiculo?.modelo || ""}
                onChange={(e) =>
                  handleInputChange("modelo", e.target.value)
                }
                
              />
            </div>
          </div>

          {/* Contato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center gap-2 text-sm sm:text-base"
              >
                Ano
              </Label>
              <Input
                inputMode="email"
                id="email"
                type="email"
                className=""
                value={selectedVeiculo?.ano || ""}
                onChange={(e) => handleInputChange("ano", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="telefone"
                className="flex items-center gap-2 text-sm sm:text-base"
              >
                KM
              </Label>
              <Input
                inputMode="tel"
                id="telefone"
                className=""
                value={selectedVeiculo?.kmatual || ""}
                onChange={(e) => {
                  handleInputChange("kmatual", e.target.value);
                }}
              />
            </div>
          </div>
         

          {/* Botões */}
        </div>
        <DialogFooter className="px-6 py-4">
          <div className="flex sm:flex-row gap-3 sm:gap-4">
            <Button
              type="submit"
              form="register-form"
              disabled={isSubmitting}
            //   onClick={handleCreateVeiculo}
              className="flex-1 text-sm sm:text-base hover:cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Cadastrar Cliente
                </>
              )}
            </Button>
            <DialogClose asChild>
              <Button className="hover:cursor-pointer" variant={"outline"}>
                Cancelar
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}
