-- =====================================================================
--  PRIMEROS ARTÍCULOS DEL BLOG
--  ---------------------------------------------------------------------
--  El blog estaba publicado pero vacío. Estos cuatro artículos están
--  escritos con lo que Emeline ya explica en la página (las preguntas
--  frecuentes, la guía por etapas y los tres auto-chequeos).
--
--  CÓMO USARLO
--  1. Entra a Supabase → SQL Editor.
--  2. Pega todo este archivo y dale RUN.
--  3. Listo: los artículos aparecen en carseatclinic.com.pa/blog
--
--  Se pueden editar después desde el CRM (pestaña Blog) sin tocar código.
--  Si vuelves a correr el archivo NO se duplican: actualiza los que ya
--  existen, porque el "slug" es único.
-- =====================================================================

insert into public.blog_posts (slug, title, excerpt, body, cover_url, author, published, published_at)
values

-- ---------------------------------------------------------------------
(
  'hasta-cuando-a-contramarcha',
  '¿Hasta cuándo debe ir a contramarcha?',
  'La respuesta corta: mucho más de lo que la mayoría cree. Te explicamos por qué el año de edad no es la señal.',
  'Es la pregunta que más nos hacen, y casi siempre viene con la misma frase: "ya cumplió el año, ¿ya lo puedo voltear?".

La respuesta corta es que la edad no es lo que manda.

Lo que manda es el límite de peso y estatura que trae la silla. Mientras tu hijo esté dentro de ese límite, lo más seguro es que siga viajando a contramarcha, aunque ya haya pasado el año, aunque ya camine y aunque las piernas se le vean dobladas.

Por qué importa tanto

En un choque de frente, que es el más común, el cuerpo sale disparado hacia adelante. Cuando el niño va a contramarcha, el respaldo de la silla recibe toda esa fuerza y la reparte por la espalda, el cuello y la cabeza al mismo tiempo.

Cuando va mirando hacia adelante, en cambio, el cuerpo queda sujeto por el arnés pero la cabeza sale disparada. Y la cabeza de un niño pequeño pesa muchísimo en proporción a su cuerpo, mientras que su cuello todavía se está formando.

"Pero se le doblan las piernas"

Es la duda que más escuchamos y la entendemos: verlo con las rodillas dobladas o los pies apoyados en el respaldo se ve incómodo.

A los niños no les molesta. Se sientan así de forma natural, igual que se sientan en el piso. Y una pierna incómoda nunca va a ser un problema comparado con proteger el cuello.

Entonces, ¿cuándo lo volteo?

Cuando pase cualquiera de estos dos límites de SU silla, no de la edad:

- El peso máximo a contramarcha que indica el fabricante.
- La estatura máxima, o cuando la cabeza le quede a menos de 2,5 cm del borde superior de la silla.

Cada modelo es distinto, por eso siempre revisamos la etiqueta de tu silla en particular.

Si tienes la duda con tu caso, escríbenos y lo vemos juntas. Es de las revisiones más rápidas que hacemos y te deja tranquila por meses.',
  'assets/guia/recien-nacido.jpg',
  'Emeline Velarde',
  true,
  now() - interval '21 days'
),

-- ---------------------------------------------------------------------
(
  'tres-errores-al-instalar-la-silla',
  'Los 3 errores que más vemos al revisar una silla',
  'No son fallas del producto. Son detalles pequeños que cualquiera puede corregir hoy mismo en su casa.',
  'Después de años revisando sillas, hay tres cosas que se repiten una y otra vez. La buena noticia es que las tres se arreglan en un minuto y las puedes revisar tú misma ahora.

1. El arnés está flojo

Es el más común de todos.

Ponle dos dedos sobre la cinta del arnés, a la altura del hombro, e intenta pellizcarla. Si logras agarrar tela sobrante, está floja.

Bien ajustada, los dedos resbalan y no agarran nada. Debe quedar firme sin lastimar.

2. El broche del pecho está muy abajo

El broche que une las dos correas sobre el pecho tiene que quedar a la altura de las axilas.

Cuando queda sobre la barriga, las correas se abren de los hombros y en un golpe el niño puede salirse por arriba. Es un ajuste de dos segundos que casi nadie revisa.

3. La silla se mueve demasiado

Agarra la silla por donde pasa el cinturón, no por el respaldo, y muévela de lado a lado.

No debería moverse más de un par de centímetros. Si baila, hay que instalarla de nuevo.

Un cuarto que no es de instalación pero cuenta

Los abrigos gruesos debajo del arnés.

El abrigo deja un espacio de aire entre el niño y la correa. En un golpe ese espacio desaparece de golpe, y el arnés que se veía ajustado queda suelto. Mejor abrocharlo primero y poner el abrigo encima, o una manta por delante.

Si revisas los tres puntos y algo no te cuadra, escríbenos. Preferimos mil veces revisarte una silla que no compraste con nosotros, a que te quedes con la duda.',
  'assets/chequeo/pellizco.jpg',
  'Emeline Velarde',
  true,
  now() - interval '14 days'
),

-- ---------------------------------------------------------------------
(
  'cuando-pasar-al-booster',
  '¿Cuándo puede pasar al booster?',
  'El booster no es un premio por cumplir años. Te contamos las tres señales que sí importan.',
  'Muchas familias apuran este cambio porque el niño "ya está grande" o porque pidió sentarse como los adultos. Pero pasar al booster antes de tiempo le quita protección justo cuando más la necesita.

El arnés de cinco puntos reparte la fuerza de un golpe en cinco lugares del cuerpo. El cinturón del carro solo en dos. Por eso, mientras el arnés le sirva, el arnés gana.

Las tres señales

Para pasar al booster tiene que cumplir las tres, no una sola:

1. Ya superó el peso o la estatura máxima del arnés de su silla actual. Esto viene en la etiqueta y cambia de un modelo a otro.
2. Puede sentarse bien durante todo el viaje. Sin recostarse de lado, sin sacar el brazo por debajo del cinturón, sin resbalarse hacia abajo cuando se duerme.
3. Tiene la madurez para no soltarse el cinturón ni acomodárselo mal.

La tercera es la que más se pasa por alto. Un niño que se duerme y se escurre en el asiento todavía no está listo, aunque le sobre peso.

Para qué sirve el booster

El booster no sujeta al niño: lo eleva.

Lo levanta hasta que el cinturón del carro le queda donde debe: cruzando el hombro (no el cuello) y apoyado en la cadera (no en la barriga).

Un cinturón sobre la barriga puede causar lesiones internas serias en un choque. Ese es todo el punto del booster.

¿Y cuándo deja el booster?

Cuando el cinturón solo le quede bien sin necesidad de elevarlo. Suele ser bastante después de lo que uno cree, alrededor de los 145 cm de estatura.

Si no estás segura de en qué punto está tu hijo, escríbenos con su edad, peso y estatura y te decimos exactamente qué le toca.',
  'assets/guia/booster.jpg',
  'Emeline Velarde',
  true,
  now() - interval '7 days'
),

-- ---------------------------------------------------------------------
(
  'la-silla-estuvo-en-un-choque',
  'Mi silla estuvo en un choque, ¿la puedo seguir usando?',
  'Aunque se vea perfecta por fuera, una silla que pasó por un golpe puede haber perdido su capacidad de proteger.',
  'Es una llamada que recibimos seguido, y casi siempre empieza igual: "fue un golpe leve y la silla se ve bien".

El problema es que el daño de una silla de auto casi nunca se ve.

Por qué no se nota

Las sillas están hechas para absorber la fuerza de un impacto deformándose por dentro. Esa es su función: sacrificarse ellas para que el niño no reciba el golpe.

Esa deformación ocurre en el plástico interno y en las fibras del arnés, y desde afuera la silla puede seguir viéndose impecable. Pero ya usó su capacidad de protección. En un segundo choque no respondería igual.

Qué hacer

Tras un choque moderado o fuerte, la recomendación general es reemplazar la silla, aunque no se vea nada raro.

En golpes muy leves algunos fabricantes permiten seguir usándola, pero eso depende del modelo y de las condiciones exactas del accidente. No es algo para decidir a ojo.

Antes de volver a usarla:

- Guarda fotos del carro y de la silla.
- Busca la etiqueta con la marca, el modelo y la fecha de fabricación.
- Escríbenos con esa información y te ayudamos a evaluar el caso.

Un detalle importante con el seguro

En muchos casos el seguro del vehículo cubre el reemplazo de la silla después de un accidente. No siempre se ofrece: hay que pedirlo.

Si necesitas una carta o el detalle técnico para presentarlo, te lo damos sin costo.

Nunca compres una silla usada sin historia

Por esta misma razón: no hay forma de saber si estuvo en un choque. Una silla de segunda mano puede verse nueva y haber perdido toda su protección.',
  'assets/reales/silla-instalada.jpg',
  'Emeline Velarde',
  true,
  now() - interval '2 days'
)

-- ---------------------------------------------------------------------
on conflict (slug) do update set
  title        = excluded.title,
  excerpt      = excluded.excerpt,
  body         = excluded.body,
  cover_url    = excluded.cover_url,
  author       = excluded.author,
  published    = excluded.published,
  published_at = excluded.published_at,
  updated_at   = now();
