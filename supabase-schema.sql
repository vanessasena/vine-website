-- Supabase SQL Schema for Sermons Table
-- Run this script in your Supabase SQL editor to create the sermons table

-- Create sermons table
CREATE TABLE IF NOT EXISTS public.sermons (
    id TEXT PRIMARY KEY,
    title_pt TEXT NOT NULL,
    title_en TEXT NOT NULL,
    preacher TEXT NOT NULL,
    date DATE NOT NULL,
    excerpt_pt TEXT NOT NULL,
    excerpt_en TEXT NOT NULL,
    content_pt TEXT NOT NULL,
    content_en TEXT NOT NULL,
    scripture TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on date for faster sorting
CREATE INDEX IF NOT EXISTS idx_sermons_date ON public.sermons(date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON public.sermons
    FOR SELECT
    USING (true);

-- Create policy to allow authenticated users to insert/update/delete
-- (This will be used later when the admin page is created)
CREATE POLICY "Allow authenticated users to insert" ON public.sermons
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update" ON public.sermons
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete" ON public.sermons
    FOR DELETE
    TO authenticated
    USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function on update
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.sermons
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample sermon data (optional - for testing)
-- This inserts the existing sermon from the static data
INSERT INTO public.sermons (
    id,
    title_pt,
    title_en,
    preacher,
    date,
    excerpt_pt,
    excerpt_en,
    content_pt,
    content_en,
    scripture
) VALUES (
    'obedecer-e-melhor-que-agradar-2025-11-02',
    'Obedecer é Melhor que Agradar',
    'Obedience is Better than Pleasing',
    'Pr Boris Carvalho',
    '2025-11-02',
    'Nesta mensagem, exploramos que obedecer é melhor que agradar porque Deus não busca esforços humanos, mas corações alinhados à Sua Palavra. A verdadeira devoção não está em sacrifícios ou desempenho, mas em uma vida transformada que expressa amor por meio da obediência.',
    'In this message, we explore that obeying is better than pleasing because God does not seek human effort, but hearts aligned with His Word. True devotion is not found in sacrifices or performance, but in a transformed life that expresses love through obedience.',
    '# Obedecer e Melhor que Agradar

**Introdução**

No domingo passado ministramos a respeito de buscarmos Aprovacao de Deus e não do mundo nem de homens.

Talvez muitos de nós crescemos com o desejo sincero de agradar a Deus. Cantamos, servimos, ofertamos, e fazemos o possível para mostrar amor e devoção.

Mas há um ponto em que o desejo de agradar pode se desviar quando passa a se basear em **nossa própria justiça**, e não na **obediência à Palavra**.

A Bíblia mostra claramente que **Deus não procura pessoas que apenas O agradem com esforço humano**, mas sim corações que O obedeçam.

***1 Samuel 15:22***
> Eis que obedecer e melhor do que sacrificar.

Contexto: Deus manda Saul destruir Amaleque e tudo o que há. Mas Saul poupou bois ovelhas gordos e etc.

### 1\. O perigo de tentar agradar a Deus pela própria justiça

Saul quis agradar a Deus sacrificando, mas desobedeceu à ordem do Senhor.

Ele fez algo bom, um sacrifício, mas fora da obediência.

Deus não rejeitou o sacrifício por ser mau, mas por ser **substituto da obediência**.

***Romanos 10:3***
> Porque, não conhecendo a justiça de Deus e procurando estabelecer a sua própria, não se sujeitaram à justiça de Deus.

Os Judeus rejeitaram a justica de Deus, eles tinham zelo, porem sem entendimento.

Agradar a Deus fora da obediência é apenas **religiosidade disfarçada de devoção**.

### 2\. A obediência revela relacionamento não desempenho

Quem busca agradar, foca em *fazer algo* para ser aceito. (Aprovacao humana)
Quem obedece, foca em *ser alguém* transformado pela Palavra.
Jesus não disse "Se quiserem Me agradar, façam isso", mas:
***João 14:15***
> Se Me amardes, guardareis os Meus mandamentos.
A obediência é fruto de amor, não de medo.
Um coração de quem confia, não de alguém que tenta merecer.

### 3\. A Obediencia de Cristo

Deus se agrada da obediência porque ela revela **dependência**.
***Salmo 147:11***
> O Senhor se agrada dos que o temem, dos que esperam na sua misericórdia.

**Nossa meta não é viver tentando agradar a Deus com esforços humanos, mas andar em obediência à Sua Palavra, que é o verdadeiro sinal de quem O ama.**
A obediência não é pesada para quem ama, o verdadeiro amor sempre se manifesta em obediência.
Jo 3:16
***Filipenses 2:8***
> E, achado na forma de homem, humilhou-se a si mesmo, sendo obediente até à morte, e morte de cruz.
**Conclusao:**
Hoje so podemos Ceiar porque um dia Alguem foi obediente a tal ponto de agradar o coracao do Pai.

---

*Mensagem pregada na Igreja Videira Cambridge em 02 de novembro de 2025*',
    '# Obeying is Better than Pleasing

**Introduction**

Last Sunday, we ministered about seeking **God''s approval** and not the approval of the world or men.

Perhaps many of us grew up with a sincere desire to please God. We sing, serve, give offerings, and do our best to show love and devotion.

But there comes a point where the desire to please can go astray when it is based on **our own righteousness** rather than on **obedience to the Word**.

The Bible clearly shows that **God is not looking for people who merely please Him with human effort**, but for hearts that obey Him.

***1 Samuel 15:22***
> "To obey is better than sacrifice."

Context: God commanded Saul to destroy Amalek and everything in it. But Saul spared the fat oxen, sheep, etc.

### 1\. The danger of trying to please God by our own righteousness

Saul wanted to please God by offering sacrifices, but he disobeyed the Lord''s command.

He did something good, a sacrifice, but outside of obedience.

God did not reject the sacrifice because it was evil, but because it was a **substitute for obedience**.

***Romans 10:3***
> "Since they did not know the righteousness of God and sought to establish their own, they did not submit to God''s righteousness."

The Jews rejected God''s righteousness; they had zeal, but lacked understanding.

Pleasing God outside of obedience is merely **religiosity disguised as devotion**.

### 2\. Obedience reveals relationship, not performance

Those who seek to please focus on *doing something* to be accepted (human approval).
Those who obey focus on *being someone* transformed by the Word.

Jesus did not say, "If you want to please Me, do this," but:
***John 14:15***
> "If you love Me, you will keep My commandments."

Obedience is a fruit of love, not fear.
A heart of trust, not someone trying to earn favor.

### 3\. The Obedience of Christ

God delights in obedience because it reveals **dependence**.

***Psalm 147:11***
> "The Lord delights in those who fear Him, in those who hope in His mercy."

**Our goal is not to live trying to please God through human effort, but to walk in obedience to His Word, which is the true sign of those who love Him.**

Obedience is not burdensome for those who love; true love always expresses itself in obedience.

John 3:16

***Philippians 2:8***
> "And being found in human form, He humbled Himself by becoming obedient to death—even death on a cross."

**Conclusion:**
Today we can only partake of the Lord''s Supper because one day Someone was obedient to such an extent that He pleased the Father''s heart.


---

*Message preached at Vine Church Cambridge on November 2, 2025*',
    '1 Samuel 15:22'
) ON CONFLICT (id) DO NOTHING;
