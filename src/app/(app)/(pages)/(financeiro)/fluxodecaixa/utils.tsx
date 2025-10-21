import { Banknote, CircleSlash, HandCoins, Handshake, IdCardLanyard, Landmark, Lightbulb, Pickaxe, ShoppingCart, Spool, Truck, Warehouse } from "lucide-react"
import { Categoria_transacao, Tipo_transacao } from "./types"

export const getTypeColor = (tipo: Tipo_transacao) => {
    switch (tipo) {
      case Tipo_transacao.RECEITA:
        return "text-green-400 not-dark:text-green-700"
      case Tipo_transacao.DESPESA:
        return "text-red-400 not-dark:text-red-700"
      case Tipo_transacao.DEPOSITO:
        return "text-green-400 not-dark:text-green-700"
      case Tipo_transacao.SAQUE:
        return "text-red-400 not-dark:text-red-700"
      
      default:
        return "text-gray-500"
    }
}

export const getCategoryIcon = (categoria: Categoria_transacao) => {
    const theme = "text-black-500 size-4"
    switch (categoria){
        case Categoria_transacao.ALUGUEL:
            return <Warehouse className={theme}/>
        case Categoria_transacao.COMISSAO_REPASSE:
            return <IdCardLanyard className={theme}/> 
        case Categoria_transacao.EQUIPAMENTO_FERRAMENTA:
            return <Pickaxe className={theme}/>
        case Categoria_transacao.IMPOSTO_TAXA:
            return <Landmark className={theme}/>  
        case Categoria_transacao.PECA:
            return <Spool className={theme}/> 
        case Categoria_transacao.PRODUTO:
            return <ShoppingCart className={theme}/>  
        case Categoria_transacao.SALARIO:
            return <HandCoins className={theme}/>  
        case Categoria_transacao.SERVICO:
            return <Handshake className={theme}/>   
        case Categoria_transacao.TRANSFERENCIA:
            return <Banknote className={theme}/>   
        case Categoria_transacao.TRANSPORTE_LOGISTICA:
            return <Truck className={theme}/>   
        case Categoria_transacao.UTILIDADE:
            return <Lightbulb className={theme}/>   
        case Categoria_transacao.OUTROS:
            return <CircleSlash className={theme}/>
        default:
        return <CircleSlash className={theme}/>
             
    }
}


export const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } 
    
    if(numbers.length > 11){
      // CNPJ: 00.000.000/0000-00
      return numbers.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }
};
