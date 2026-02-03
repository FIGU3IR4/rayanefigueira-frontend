export const formatarDataBR = (dataString) => {
  if (!dataString) return "";
  const [ano, mes, dia] = dataString.split('-');
  return `${dia}/${mes}/${ano}`;
};

export const getHoje = () => new Date().toISOString().split('T')[0];