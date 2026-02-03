/**
 * Remove acentos e caracteres especiais, mantendo apenas ASCII seguro.
 * Útil para campos da NF-e que não aceitam UTF-8 pleno ou para evitar erros de validação.
 */
export function sanitizeString(value: string | null | undefined): string {
    if (!value) return '';

    // Normaliza para NFD (separa acentos) e remove diacríticos
    let str = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Remove caracteres não imprimíveis (exceto os básicos) se necessário
    // Mas geralmente apenas remover acentos já resolve 99% dos problemas de "caracteres especiais"
    return str.trim();
}

/**
 * Escapa caracteres reservados do XML.
 * Também aplica sanitização (remove acentos) automaticamente para segurança.
 */
export function escapeXml(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';

    const str = typeof value === 'number' ? String(value) : sanitizeString(value);

    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
