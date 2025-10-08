export default function Header() {
    return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          Financeiro
        </h1>
        <p className="text-muted-foreground text-pretty">
          Gestão completa de finanças
        </p>
      </div>
      <div className="flex items-center gap-2">
        {/* <Button className="hover:cursor-pointer ">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Button> */}
        
      </div>
    </div>
    )
}