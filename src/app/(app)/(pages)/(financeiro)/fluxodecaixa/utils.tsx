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

export const getCategoryIcon = (categoria: string) => {
    const theme = "text-black-500 size-4"
    switch (categoria){
        case "ALUGUEL":
            return <Warehouse className={theme}/>
        case "COMISSÃO":
            return <IdCardLanyard className={theme}/> 
        case "EQUIPAMENTO":
            return <Pickaxe className={theme}/>
        case "FERRAMENTA":
            return <Pickaxe className={theme}/>
        case "IMPOSTO":
            return <Landmark className={theme}/>  
        case "TAXA":
            return <Landmark className={theme}/>  
        case "PEÇA":
            return <Spool className={theme}/> 
        case "PRODUTO":
            return <ShoppingCart className={theme}/>  
        case "SALÁRIO":
            return <HandCoins className={theme}/>  
        case "REMUNERAÇÃO":
            return <HandCoins className={theme}/>  
        case "SERVIÇO":
            return <Handshake className={theme}/>   
        case "TRANSFERÊNCIA":
            return <Banknote className={theme}/>   
        case "TRANSPORTE":
            return <Truck className={theme}/>   
        case "LOGÍSTICA":
            return <Truck className={theme}/>   
        case "UTILIDADE":
            return <Lightbulb className={theme}/>   
        case "OUTROS":
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
