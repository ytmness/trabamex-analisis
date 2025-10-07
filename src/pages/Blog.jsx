import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Calendar } from 'lucide-react';

const blogPosts = [
  {
    slug: 'como-disponer-residuos-hospitalarios-de-forma-segura-en-mexico',
    title: 'Cómo disponer residuos hospitalarios de forma segura en México',
    description: 'Guía práctica de TRABAMEX sobre la correcta disposición de residuos hospitalarios y RPBI conforme a la normativa mexicana.',
    date: '07 de Septiembre, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1584985392394-263f4b66eb1a?w=800&h=600&fit=crop',
    author: 'Equipo TRABAMEX'
  },
  {
    slug: 'normativas-clave-rpbi-2025',
    title: 'Normativas clave para el manejo de RPBI en 2025',
    description: 'Un resumen de las regulaciones más importantes que todo generador de residuos peligrosos debe conocer para el próximo año.',
    date: '15 de Septiembre, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed22c4413346?w=800&h=600&fit=crop',
    author: 'Equipo TRABAMEX'
  },
  {
    slug: 'impacto-ambiental-mal-manejo-residuos',
    title: 'Impacto ambiental de un mal manejo de residuos peligrosos',
    description: 'Analizamos las consecuencias de una gestión inadecuada de RP y RPBI y cómo TRABAMEX ayuda a mitigarlas.',
    date: '23 de Septiembre, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&h=600&fit=crop',
    author: 'Equipo TRABAMEX'
  }
];

const BlogPage = () => {
  return (
    <>
      <Helmet>
        <title>Blog TRABAMEX | Guías y Normativas de Manejo e Incineración de Residuos</title>
        <meta name="description" content="Artículos sobre disposición final, incineración y normativas para RP, RPBI y RME en México. Consejos prácticos para generadores." />
        <link rel="canonical" href="https://trabamex.com/blog/" />
        <meta property="og:title" content="Blog TRABAMEX | Guías y Normativas de Manejo e Incineración de Residuos" />
        <meta property="og:description" content="Artículos sobre disposición final, incineración y normativas para RP, RPBI y RME en México. Consejos prácticos para generadores." />
        <meta property="og:type" content="blog" />
        <meta property="og:url" content="https://trabamex.com/blog/" />
        <meta property="og:image" content="https://horizons-cdn.hostinger.com/fd2fddc7-4c04-4322-9b0a-f43371bdbe1b/trabamex-og-blog.png" />
      </Helmet>
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">Blog de TRABAMEX</h1>
            <p className="text-lg text-gray-600">
              Mantente informado con nuestras guías, noticias y artículos sobre el manejo responsable de residuos peligrosos en México.
            </p>
            <div className="w-24 h-1.5 bg-red-600 mx-auto mt-6 mb-12"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <Card className="h-full flex flex-col overflow-hidden group">
                  <div className="overflow-hidden">
                    <img src={post.imageUrl} alt={`Imagen para el artículo: ${post.title}`} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"/>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl h-20">{post.title}</CardTitle>
                    <CardDescription className="flex items-center text-sm text-gray-500 pt-2">
                        <Calendar className="h-4 w-4 mr-2" /> {post.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-600 text-sm">{post.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link to={`/blog/${post.slug}`}>
                        Leer Artículo <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;
