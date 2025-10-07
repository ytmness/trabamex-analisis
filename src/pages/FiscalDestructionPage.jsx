import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Pill, Utensils, SprayCan, FileArchive, Tag, CheckCircle, ShieldCheck, Lock, FileText, ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
const benefits = [{
  icon: CheckCircle,
  title: "Cumplimiento Fiscal",
  description: "Deducibilidad y baja de inventarios 100% válida ante el SAT."
}, {
  icon: ShieldCheck,
  title: "Seguridad Sanitaria",
  description: "Manejo seguro de medicamentos caducos o controlados, evitando riesgos."
}, {
  icon: Lock,
  title: "Protección de Marca",
  description: "Evita que productos defectuosos o caducos regresen al mercado ilegal."
}, {
  icon: FileText,
  title: "Evidencia Documental",
  description: "Acta de Destrucción Fiscal con fotos, video y folio oficial para tu tranquilidad."
}];
const acceptedItems = [{
  icon: Pill,
  name: "Medicamentos controlados y no controlados"
}, {
  icon: Utensils,
  name: "Alimentos y bebidas caducas"
}, {
  icon: SprayCan,
  name: "Cosméticos y productos de higiene"
}, {
  icon: FileArchive,
  name: "Documentos confidenciales y archivos"
}, {
  icon: Tag,
  name: "Etiquetas, envases y empaques"
}];
const processSteps = [{
  number: "01",
  title: "Solicitud y Registro",
  description: "Registro de mercancías/documentos con folio único para trazabilidad total."
}, {
  number: "02",
  title: "Aviso a Autoridades",
  description: "Coordinamos el aviso al SAT y la presencia de COFEPRIS cuando es necesario."
}, {
  number: "03",
  title: "Transporte Seguro",
  description: "Recolección en unidades autorizadas con estricta cadena de custodia."
}, {
  number: "04",
  title: "Destrucción Final",
  description: "Incineración controlada o trituración, según el residuo, en nuestras instalaciones certificadas."
}, {
  number: "05",
  title: "Entrega de Certificado",
  description: "Emisión del Acta/Certificado Fiscal con toda la evidencia fotográfica y videográfica."
}];
const faqItems = [{
  question: "¿Qué es un Acta de Destrucción Fiscal?",
  answer: "Es el documento oficial que ampara la destrucción de tus mercancías. Incluye detalles del proceso, evidencia fotográfica, y es el comprobante que necesitas para la deducción fiscal ante el SAT."
}, {
  question: "¿Necesito estar presente durante la destrucción?",
  answer: "No es obligatorio. Nuestro proceso está diseñado para ser 100% transparente y auditable. Te proporcionamos evidencia videográfica y fotográfica, además del acta oficial, para que tengas total certeza del proceso."
}, {
  question: "¿Qué normativas cumple TRABAMEX?",
  answer: "Cumplimos con el Código Fiscal de la Federación, la Ley General de Salud, la LGPGIR y todas las NOM aplicables. Además, contamos con certificaciones ISO 9001, 14001, 27001 y 45001 que respaldan la calidad y seguridad de nuestros procesos."
}, {
  question: "¿Cuánto tiempo tarda el proceso completo?",
  answer: "El tiempo varía según el tipo y volumen de la mercancía, así como los requerimientos de la autoridad. Generalmente, desde la solicitud hasta la entrega del certificado, el proceso puede tomar de 1 a 3 semanas. Contáctanos para una estimación precisa."
}];
const FiscalDestructionPage = () => {
  return <>
      <Helmet>
        <title>Destrucción Fiscal de Mercancías y Documentos en México | TRABAMEX</title>
        <meta name="description" content="TRABAMEX ofrece destrucción fiscal certificada de medicamentos, productos y documentos. Cumple con SAT, COFEPRIS y SEMARNAT. Solicita tu cotización ahora." />
      </Helmet>

      {/* Hero Section */}
      <div className="relative bg-cover bg-center text-white" style={{
      backgroundImage: "url('https://horizons-cdn.hostinger.com/fd2fddc7-4c04-4322-9b0a-f43371bdbe1b/bfbcc3ab848e9b7a86f867ca453b7b3d.png')"
    }}>
        <div className="absolute inset-0 bg-gray-900 bg-opacity-60"></div>
        <div className="relative container mx-auto px-4 py-24 text-center">
          <motion.h1 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} className="text-4xl md:text-6xl font-bold leading-tight">
            Destrucción Fiscal de Mercancías y Documentos en México
          </motion.h1>
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-gray-200">
            En TRABAMEX ofrecemos un servicio integral de destrucción fiscal de medicamentos, productos y documentos confidenciales. Estamos autorizados por SEMARNAT, COFEPRIS y SICT para garantizar un proceso seguro, certificado y 100% válido ante el SAT.
          </motion.p>
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4
        }} className="mt-10">
            <Button asChild size="lg" className="bg-trabamex-red hover:bg-trabamex-red-dark text-lg">
              <Link to="/contacto" state={{
              subject: "Cotización de Destrucción Fiscal"
            }}>Solicitar Cotización</Link>
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          
          {/* What is Fiscal Destruction? */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-trabamex-dark mb-6">¿Qué es la destrucción fiscal?</h2>
              <p className="text-lg text-trabamex-gray mb-4">
                La destrucción fiscal es el procedimiento mediante el cual las empresas eliminan mercancías caducas, dañadas o fuera de uso, bajo supervisión fiscal y sanitaria, para asegurar su baja de inventarios y evitar riesgos de reutilización ilegal.
              </p>
              <p className="text-lg text-trabamex-gray">
                En TRABAMEX realizamos este proceso con la máxima trazabilidad, incluyendo aviso al SAT, presencia de autoridades sanitarias (COFEPRIS) cuando aplica, y con la disposición final mediante incineración controlada en nuestras instalaciones.
              </p>
            </div>
            <div>
              <img class="rounded-lg shadow-xl h-96 w-full object-cover" alt="Proceso de destrucción fiscal en planta de tratamiento" src="https://horizons-cdn.hostinger.com/fd2fddc7-4c04-4322-9b0a-f43371bdbe1b/photo-1567516847971-81df16eefa90-xYDcS.jpeg" />
            </div>
          </div>

          {/* Benefits & Accepted Items Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12 mb-24">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Benefits Column */}
              <div>
                <h2 className="text-3xl font-bold text-trabamex-dark mb-8">Beneficios de la Destrucción Fiscal</h2>
                <div className="space-y-6">
                  {benefits.map((benefit, index) => <motion.div key={index} initial={{
                  opacity: 0,
                  x: -20
                }} whileInView={{
                  opacity: 1,
                  x: 0
                }} transition={{
                  duration: 0.5,
                  delay: index * 0.1
                }} viewport={{
                  once: true
                }} className="flex items-start">
                      <div className="flex-shrink-0 mr-4 mt-1">
                        <div className="bg-trabamex-red-light p-3 rounded-full">
                          <benefit.icon className="h-6 w-6 text-trabamex-red" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-trabamex-dark">{benefit.title}</h3>
                        <p className="text-trabamex-gray">{benefit.description}</p>
                      </div>
                    </motion.div>)}
                </div>
              </div>
              {/* Accepted Items Column */}
              <div>
                <img class="rounded-lg shadow-md h-64 w-full object-cover mb-8" alt="Materiales para destrucción fiscal" src="https://horizons-cdn.hostinger.com/fd2fddc7-4c04-4322-9b0a-f43371bdbe1b/tratamiento-final-residuos-1024x683-Ax83C.jpg" />
                <h2 className="text-3xl font-bold text-trabamex-dark mb-8">Residuos y Productos Aceptados</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-8">
                  {acceptedItems.map((item, index) => <motion.div key={index} initial={{
                  opacity: 0,
                  y: 20
                }} whileInView={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  duration: 0.5,
                  delay: index * 0.1
                }} viewport={{
                  once: true
                }} className="flex items-center">
                      <item.icon className="h-8 w-8 text-trabamex-red mr-3" />
                      <span className="font-semibold text-trabamex-gray">{item.name}</span>
                    </motion.div>)}
                </div>
              </div>
            </div>
          </div>

          {/* Process Section */}
          <div className="mb-24">
            <h2 className="text-3xl md:text-4xl font-bold text-trabamex-dark text-center mb-12">Nuestro Proceso de Destrucción Fiscal en 5 Pasos</h2>
            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-5 bottom-5 w-0.5 bg-gray-200 -translate-x-1/2"></div>
              {processSteps.map((step, index) => <div key={index} className={`flex items-center w-full mb-8 md:mb-0 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="md:w-5/12">
                    <motion.div initial={{
                  opacity: 0,
                  x: index % 2 === 0 ? -50 : 50
                }} whileInView={{
                  opacity: 1,
                  x: 0
                }} transition={{
                  duration: 0.6
                }} viewport={{
                  once: true
                }} className={`p-8 bg-white rounded-xl shadow-lg border border-gray-100 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <h3 className="text-2xl font-bold text-trabamex-red mb-2">{step.title}</h3>
                      <p className="text-trabamex-gray">{step.description}</p>
                    </motion.div>
                  </div>
                  <div className="hidden md:flex md:w-2/12 justify-center">
                    <div className="bg-trabamex-red text-white h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold z-10">
                      {step.number}
                    </div>
                  </div>
                  <div className="md:w-5/12"></div>
                </div>)}
            </div>
          </div>

          {/* Compliance Section */}
          <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-100 mb-24">
            <h2 className="text-3xl font-bold text-trabamex-dark text-center mb-8">Cumplimiento Normativo y Certificaciones</h2>
            <p className="text-center text-lg text-trabamex-gray max-w-4xl mx-auto">
              La destrucción fiscal en TRABAMEX se realiza conforme al Código Fiscal de la Federación (CFF, art. 32-F), Ley General para la Prevención y Gestión Integral de Residuos (LGPGIR), Ley General de Salud, y las NOM-087 y NOM-059. Además, implementamos sistemas de gestión basados en ISO 9001, ISO 14001, ISO 27001 e ISO 45001.
            </p>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-3xl md:text-4xl font-bold text-trabamex-dark text-center mb-12">Preguntas Frecuentes</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-lg font-semibold text-left">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-base text-trabamex-gray">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>)}
            </Accordion>
          </div>

        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-trabamex-dark">
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">¿Necesitas servicios de Destrucción Fiscal?</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Descubre cómo podemos ayudarte a cumplir con la normativa, proteger tu marca y asegurar la correcta disposición de tus productos y documentos.
          </p>
          <Button asChild size="lg" className="bg-trabamex-red hover:bg-trabamex-red-dark text-lg">
            <Link to="/contacto" state={{
            subject: "Cotización de Destrucción Fiscal"
          }}>
              Cotiza tu Servicio
            </Link>
          </Button>
        </div>
      </div>
    </>;
};
export default FiscalDestructionPage;