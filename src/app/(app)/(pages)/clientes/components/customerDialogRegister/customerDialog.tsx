"use client";

import type React from "react";
import { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EditContent from "./editContent";
import RegisterContent from "./registerContent";
import { Customer } from "../../types";
import { NewCustomer } from "./types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";

interface CustomerDialogProps {
  customerId?: number;
  children?: ReactNode;
  isOpen?: boolean;
  setIsOpen?: (value: boolean) => void;
  setSelectedCustomerId?: (value: number | undefined) => void;
  onRegister?:(c: Customer)=> void;
}

export function CustomerDialog({
  customerId,
  children,
  isOpen,
  setIsOpen,
  setSelectedCustomerId,
  onRegister,
}: CustomerDialogProps) {
  // estado interno caso o componente não seja controlado por props
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen ?? internalOpen;
  const setOpen = setIsOpen ?? setInternalOpen;

  const [, setSelectedCustomer] = useState<
    Customer | undefined
  >(undefined);
  const [, setIsLoading] = useState(false);
  const [newCustomer, setNewCustomer] = useState<NewCustomer>({
    tipopessoa: "FISICA",
    bairro:"",
    cpfcnpj: "",
    nomerazaosocial: "",
    email: "",
    telefone: "",
    endereco: "",
    enderecocomplemento: "",
    endereconumero:"",
    cidade: "",
    estado: "",
    cep: "",
    inscricaoestadual: "",
    inscricaomunicipal: "",
    codigomunicipio: "",
    status: "ATIVO",
    foto: "",
  });

  const handleGetCustomer = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/customers/${id}`);
      if (response.status === 200) {
        const { data } = response;
        setSelectedCustomer(data.data);
        // console.log("Cliente carregado:", data.data);
      }
    } catch (error) {
      console.log("Erro ao buscar cliente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Busca o cliente sempre que o dialog abrir e existir um customerId
  useEffect(() => {
    if (open && customerId) {
      handleGetCustomer(customerId);
    }
  }, [open, customerId]);

    const isDesktop = useMediaQuery("(min-width: 768px)");
    if(isDesktop){

      return (
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            // sempre sincroniza o estado (controlado ou interno)
            setOpen(nextOpen);
    
            if (!nextOpen) {
              setSelectedCustomerId?.(undefined);
              setSelectedCustomer(undefined);
              setNewCustomer({
                tipopessoa: "FISICA",
                cpfcnpj: "",
                nomerazaosocial: "",
                email: "",
                bairro:"",
                telefone: "",
                endereco: "",
                enderecocomplemento: "",
                endereconumero: "",
                cidade: "",
                estado: "",
                cep: "",
                inscricaoestadual: "",
                inscricaomunicipal: "",
                codigomunicipio: "",
                status: "ATIVO",
                foto: "",
              });
            }
          }}
        >
          <DialogTrigger autoFocus={false} asChild>
            {children}
          </DialogTrigger>
    
          {customerId ? (
            <EditContent
            
              customerId={customerId}
            />
          ) : (
            <RegisterContent
              setSelectedCustomerId={setSelectedCustomerId}
              newCustomer={newCustomer}
              setNewCustomer={setNewCustomer}
              onRegister={onRegister} 
    
            />
          )}
        </Dialog>
      );
    }

    return (
        <Drawer
          open={open}
          onOpenChange={(nextOpen) => {
            // sempre sincroniza o estado (controlado ou interno)
            setOpen(nextOpen);
    
            if (!nextOpen) {
              setSelectedCustomerId?.(undefined);
              setSelectedCustomer(undefined);
              setNewCustomer({
                tipopessoa: "FISICA",
                cpfcnpj: "",
                nomerazaosocial: "",
                email: "",
                bairro:"",
                telefone: "",
                endereco: "",
                enderecocomplemento: "",
                endereconumero: "",
                cidade: "",
                estado: "",
                cep: "",
                inscricaoestadual: "",
                inscricaomunicipal: "",
                codigomunicipio: "",
                status: "ATIVO",
                foto: "",
              });
            }
          }}
        >
          <DrawerTrigger autoFocus={false} asChild>
            {children}
          </DrawerTrigger>
    
          {customerId ? (
            <EditContent
              isDesktop={isDesktop}
              customerId={customerId}
            />
          ) : (
            <RegisterContent
            isDesktop={isDesktop}
              setSelectedCustomerId={setSelectedCustomerId}
              newCustomer={newCustomer}
              setNewCustomer={setNewCustomer}
              onRegister={onRegister} 
    
            />
          )}
        </Drawer>
      );
}
