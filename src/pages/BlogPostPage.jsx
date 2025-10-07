import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const blogContent = {
  'como-disponer-residuos-hospitalarios-de-forma-segura-en-mexico': {
    title: 'Cómo disponer residuos hospitalarios de forma segura en México',
    description: 'Guía práctica de TRABAMEX sobre la correcta disposición de residuos hospitalarios y RPBI conforme a la normativa mexicana.',
    date: '07 de Septiembre, 2025',
    author: 'Equipo TRABAMEX',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-6f7f6f1f1b2d?w=800&h=600&fit=crop',
    content: (
      <div className="space-y-8">
        <p className="text-lg text-gray-600 leading-relaxed">El manejo adecuado de los Residuos Peligrosos Biológico-Infecciosos (RPBI) es un pilar fundamental para la salud pública y la protección del medio ambiente en México. Hospitales, clínicas, laboratorios y cualquier establecimiento que genere este tipo de residuos tiene la responsabilidad legal y ética de garantizar su correcta disposición. En esta guía, TRABAMEX te orienta sobre los pasos clave para hacerlo de forma segura y en cumplimiento con la <strong>NOM-087-ECOL-SSA1-2002</strong>.</p>
        
        <div>
          <h2 className="text-2xl font-bold text-black mt-8 mb-4">1. Identificación y Clasificación de los Residuos</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">El primer paso es saber qué es y qué no es un RPBI. La norma los clasifica en cinco categorías:</p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-lg text-gray-600">
            <li><strong>Sangre:</strong> Y sus componentes en forma líquida.</li>
            <li><strong>Cultivos y cepas de agentes biológico-infecciosos.</strong></li>
            <li><strong>Patológicos:</strong> Tejidos, órganos y partes que se extirpan o remueven durante necropsias o cirugías.</li>
            <li><strong>Residuos no anatómicos:</strong> Recipientes, materiales de curación, empapados, saturados o goteando sangre o fluidos corporales.</li>
            <li><strong>Objetos punzocortantes:</strong> Que han estado en contacto con humanos o animales o sus muestras biológicas.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-black mt-8 mb-4">2. Envasado y Almacenamiento Temporal</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">Cada tipo de residuo debe ser envasado en un recipiente específico para evitar fugas y exposición:</p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-lg text-gray-600">
            <li><strong>Líquidos (Sangre):</strong> Recipientes herméticos rojos.</li>
            <li><strong>Sólidos (Gasas, algodones):</strong> Bolsas de polietileno rojas.</li>
            <li><strong>Punzo-cortantes (Agujas, bisturís):</strong> Recipientes rígidos de polipropileno rojo.</li>
            <li><strong>Patológicos:</strong> Bolsas de polietileno amarillas (sólidos) o recipientes herméticos amarillos (líquidos).</li>
          </ul>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">El almacenamiento temporal debe realizarse en un área designada, separada de las áreas de pacientes y con acceso restringido.</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-black mt-8 mb-4">3. Recolección y Transporte Externo</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">Esta etapa solo puede ser realizada por empresas autorizadas por la SEMARNAT y la SICT, como <strong>TRABAMEX</strong>. Nuestros vehículos están especialmente equipados y nuestro personal capacitado para transportar los residuos de manera segura, desde su establecimiento hasta nuestra planta de tratamiento.</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-black mt-8 mb-4">4. Tratamiento y Disposición Final</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">Los RPBI deben ser tratados por métodos físicos o químicos que garanticen la eliminación de microorganismos patógenos. En TRABAMEX, utilizamos tecnologías como autoclave e incineración para neutralizar el peligro biológico. Una vez tratados, los residuos se convierten en no peligrosos y pueden ser dispuestos en rellenos sanitarios autorizados.</p>
        </div>
        
        <div className="mt-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <p className="text-lg text-gray-800 leading-relaxed italic"><strong>Conclusión:</strong> La gestión segura de residuos hospitalarios es una cadena de responsabilidades. Contratar un servicio profesional como el de TRABAMEX no solo garantiza el cumplimiento normativo, sino que también protege a tu personal, a la comunidad y al medio ambiente. <Link to="/contacto" className="text-red-600 hover:underline font-semibold">Contáctanos para una asesoría personalizada.</Link></p>
        </div>
      </div>
    ),
  },
  'normativas-clave-rpbi-2025': {
     title: 'Normativas clave para el manejo de RPBI en 2025',
    description: 'Un resumen de las regulaciones más importantes que todo generador de residuos peligrosos debe conocer para el próximo año.',
    date: '15 de Septiembre, 2025',
    author: 'Equipo TRABAMEX',
    imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed22c4413346?w=800&h=600&fit=crop',
    content: `<p class="text-lg text-gray-600 leading-relaxed">Contenido del artículo sobre normativas clave...</p>`
  },
  'impacto-ambiental-mal-manejo-residuos': {
    title: 'Impacto ambiental de un mal manejo de residuos peligrosos',
    description: 'Analizamos las consecuencias de una gestión inadecuada de RP y RPBI y cómo TRABAMEX ayuda a mitigarlas.',
    date: '23 de Septiembre, 2025',
    author: 'Equipo TRABAMEX',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&h=600&fit=crop',
    content: `<p class="text-lg text-gray-600 leading-relaxed">Contenido del artículo sobre impacto ambiental...</p>`
  }
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = blogContent[slug];

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold">Post no encontrado</h1>
        <p className="mt-4 text-lg">El artículo que buscas no existe o ha sido movido.</p>
        <Button asChild className="mt-8">
          <Link to="/blog">Volver al Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title}</title>
        <meta name="description" content={post.description} />
      </Helmet>
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <div className="mb-8">
                <Button asChild variant="ghost" className="mb-4">
                    <Link to="/blog"><ArrowLeft className="h-4 w-4 mr-2" /> Volver al Blog</Link>
                </Button>
                <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">{post.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> {post.date}</div>
                    <div className="flex items-center"><User className="h-4 w-4 mr-2" /> {post.author}</div>
                </div>
            </div>

            <img src={post.imageUrl} alt={`Imagen principal para: ${post.title}`} className="w-full h-96 object-cover rounded-lg shadow-lg mb-8" />
            
            <div className="max-w-none">
              {post.content}
            </div>

          </motion.article>
        </div>
      </div>
    </>
  );
};

export default BlogPostPage;
