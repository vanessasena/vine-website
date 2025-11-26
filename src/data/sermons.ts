// Sermon data structure - Easy to update with new sermons
export interface Sermon {
  id: string;
  title: {
    pt: string;
    en: string;
  };
  preacher: string;
  date: string; // YYYY-MM-DD format
  excerpt: {
    pt: string;
    en: string;
  };
  content: {
    pt: string;
    en: string;
  };
  scripture?: string; // Optional Bible reference
}

// Add new sermons to this array - newest first
export const sermons: Sermon[] = [
  {
    id: "obedecer-e-melhor-que-agradar-2025-11-02",
    title: {
      pt: "Obedecer é Melhor que Agradar",
      en: "Obedience is Better than Pleasing"
    },
    preacher: "Pr Boris Carvalho",
    date: "2025-11-02",
    scripture: "1 Samuel 15:22",
    excerpt: {
      pt: "Nesta mensagem, exploramos que obedecer é melhor que agradar porque Deus não busca esforços humanos, mas corações alinhados à Sua Palavra. A verdadeira devoção não está em sacrifícios ou desempenho, mas em uma vida transformada que expressa amor por meio da obediência.",
      en: "In this message, we explore that obeying is better than pleasing because God does not seek human effort, but hearts aligned with His Word. True devotion is not found in sacrifices or performance, but in a transformed life that expresses love through obedience."
    },
    content: {
      pt: `# Obedecer e Melhor que Agradar

**Introdução**

No domingo passado ministramos a respeito de buscarmos Aprovacao de Deus e não do mundo nem de homens.

Talvez muitos de nós crescemos com o desejo sincero de agradar a Deus. Cantamos, servimos, ofertamos, e fazemos o possível para mostrar amor e devoção.

Mas há um ponto em que o desejo de agradar pode se desviar quando passa a se basear em **nossa própria justiça**, e não na **obediência à Palavra**.

A Bíblia mostra claramente que **Deus não procura pessoas que apenas O agradem com esforço humano**, mas sim corações que O obedeçam.

***1 Samuel 15:22***
> Eis que obedecer e melhor do que sacrificar.

Contexto: Deus manda Saul destruir Amaleque e tudo o que há. Mas Saul poupou bois ovelhas gordos e etc.

### 1\. O perigo de tentar agradar a Deus pela própria justiça

Saul quis agradar a Deus sacrificando, mas desobedeceu à ordem do Senhor.

Ele fez algo bom, um sacrifício, mas fora da obediência.

Deus não rejeitou o sacrifício por ser mau, mas por ser **substituto da obediência**.

***Romanos 10:3***
> Porque, não conhecendo a justiça de Deus e procurando estabelecer a sua própria, não se sujeitaram à justiça de Deus.

Os Judeus rejeitaram a justica de Deus, eles tinham zelo, porem sem entendimento.

Agradar a Deus fora da obediência é apenas **religiosidade disfarçada de devoção**.

### 2\. A obediência revela relacionamento não desempenho

Quem busca agradar, foca em *fazer algo* para ser aceito. (Aprovacao humana)
Quem obedece, foca em *ser alguém* transformado pela Palavra.
Jesus não disse “Se quiserem Me agradar, façam isso”, mas:
***João 14:15***
> Se Me amardes, guardareis os Meus mandamentos.
A obediência é fruto de amor, não de medo.
Um coração de quem confia, não de alguém que tenta merecer.

### 3\. A Obediencia de Cristo

Deus se agrada da obediência porque ela revela **dependência**.
***Salmo 147:11***
> O Senhor se agrada dos que o temem, dos que esperam na sua misericórdia.

**Nossa meta não é viver tentando agradar a Deus com esforços humanos, mas andar em obediência à Sua Palavra, que é o verdadeiro sinal de quem O ama.**
A obediência não é pesada para quem ama, o verdadeiro amor sempre se manifesta em obediência.
Jo 3:16
***Filipenses 2:8***
> E, achado na forma de homem, humilhou-se a si mesmo, sendo obediente até à morte, e morte de cruz.
**Conclusao:**
Hoje so podemos Ceiar porque um dia Alguem foi obediente a tal ponto de agradar o coracao do Pai.

---

*Mensagem pregada na Igreja Videira Cambridge em 02 de novembro de 2025*`,
      en: `# Obeying is Better than Pleasing

**Introduction**

Last Sunday, we ministered about seeking **God's approval** and not the approval of the world or men.

Perhaps many of us grew up with a sincere desire to please God. We sing, serve, give offerings, and do our best to show love and devotion.

But there comes a point where the desire to please can go astray when it is based on **our own righteousness** rather than on **obedience to the Word**.

The Bible clearly shows that **God is not looking for people who merely please Him with human effort**, but for hearts that obey Him.

***1 Samuel 15:22***
> “To obey is better than sacrifice.”

Context: God commanded Saul to destroy Amalek and everything in it. But Saul spared the fat oxen, sheep, etc.

### 1\. The danger of trying to please God by our own righteousness

Saul wanted to please God by offering sacrifices, but he disobeyed the Lord's command.

He did something good, a sacrifice, but outside of obedience.

God did not reject the sacrifice because it was evil, but because it was a **substitute for obedience**.

***Romans 10:3***
> “Since they did not know the righteousness of God and sought to establish their own, they did not submit to God’s righteousness.”

The Jews rejected God’s righteousness; they had zeal, but lacked understanding.

Pleasing God outside of obedience is merely **religiosity disguised as devotion**.

### 2\. Obedience reveals relationship, not performance

Those who seek to please focus on *doing something* to be accepted (human approval).
Those who obey focus on *being someone* transformed by the Word.

Jesus did not say, “If you want to please Me, do this,” but:
***John 14:15***
> “If you love Me, you will keep My commandments.”

Obedience is a fruit of love, not fear.
A heart of trust, not someone trying to earn favor.

### 3\. The Obedience of Christ

God delights in obedience because it reveals **dependence**.

***Psalm 147:11***
> “The Lord delights in those who fear Him, in those who hope in His mercy.”

**Our goal is not to live trying to please God through human effort, but to walk in obedience to His Word, which is the true sign of those who love Him.**

Obedience is not burdensome for those who love; true love always expresses itself in obedience.

John 3:16

***Philippians 2:8***
> “And being found in human form, He humbled Himself by becoming obedient to death—even death on a cross.”

**Conclusion:**
Today we can only partake of the Lord’s Supper because one day Someone was obedient to such an extent that He pleased the Father’s heart.


---

*Message preached at Vine Church KWC on November 2, 2025*`
    }
  },

];

// Helper function to get sermons sorted by date (newest first)
export const getSortedSermons = (): Sermon[] => {
  return [...sermons].sort((a, b) => {
    // Parse dates manually to avoid timezone issues
    const [yearA, monthA, dayA] = a.date.split('-').map(Number);
    const [yearB, monthB, dayB] = b.date.split('-').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateB.getTime() - dateA.getTime();
  });
};

// Helper function to get a sermon by ID
export const getSermonById = (id: string): Sermon | undefined => {
  return sermons.find(sermon => sermon.id === id);
};

// Helper function to format date
export const formatDate = (dateString: string, locale: string): string => {
  // Parse the date string manually to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed

  return date.toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};