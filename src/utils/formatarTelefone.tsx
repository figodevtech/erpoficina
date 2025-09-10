export default function formatarTelefone(numero: string) {
  const numeros = numero.replace(/\D/g, '');

  if (numeros.length === 11) {
    // Formato: (XX) XXXXX-XXXX
    return numeros.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (numeros.length === 10) {
    // Formato: (XX) XXXX-XXXX
    return numeros.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  } else {
    return 'Número inválido';
  }
}
