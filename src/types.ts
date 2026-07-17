export interface Turma {
  id: string;
  nome: string;
}

export interface Cursista {
  id: string;
  nome: string;
  whatsapp: string;
  faltas: number;
  rafPendente: boolean;
}

export interface Templates {
  leve: string;
  atencao: string;
  limite: string;
  raf: string;
  gravacao: string;
}

export const TOTAL_ENCONTROS = 10;

export const DEFAULT_TEMPLATES: Templates = {
  leve: "Oi {nome}! Tudo bem? Aqui é a formadora do grupo de estudos de Lógica Computacional. Senti sua falta no nosso encontro desta semana da turma {turma} e queria saber se está tudo certo com você. Se quiser, me conta o motivo pra eu registrar direitinho — e qualquer coisa, te ajudo a colocar em dia o que foi visto. Conto com você no próximo encontro!",
  atencao: "Oi {nome}, tudo bem? Aqui é a formadora da turma {turma}. Você já teve {faltas} faltas ({percentual}%) nos nossos encontros. O limite permitido é de 25% de faltas ao longo da jornada, então estamos chegando perto desse limite. Queria entender se está passando por alguma dificuldade para participar e ver como posso te apoiar para não perder a formação. Pode me responder por aqui quando puder.",
  limite: "Oi {nome}, aqui é a formadora da turma {turma}. Preciso falar com você com atenção: você já ultrapassou o limite de faltas permitido no grupo de estudos ({faltas} faltas, {percentual}%). Isso coloca em risco a conclusão da sua jornada de formação. Antes de qualquer decisão, quero entender o que está acontecendo e ver se ainda há como reverter essa situation junto com a tutoria de formação. Por favor, me responda assim que possível.",
  raf: "Oi {nome}! Aqui é a formadora da turma {turma}. Vi que o RAF do nosso último encontro ainda está pendente. Ele é uma das atividades avaliativas da jornada e precisa ser respondido — leva só alguns minutinhos. Você consegue preencher até amanhã? Qualquer dificuldade para encontrar o link, me chama que te ajudo.",
  gravacao: "Oi {nome}! Tudo bem? Aqui é a formadora da turma {turma}. Passando para lembrar que a gravação do nosso encontro está disponível na playlist do grupo, caso você não tenha conseguido participar. Você pode assistir com calma e depois realizar as atividades da jornada, incluindo o RAF, para não ficar pendente. Qualquer dúvida enquanto assiste, me chama por aqui!"
};
