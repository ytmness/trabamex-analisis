import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminClientDetailPage = () => {
  const { clientId } = useParams();

  return (
    <>
      <Helmet>
        <title>Detalle de Cliente - Admin MIR</title>
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Detalle del Cliente: {clientId}</h1>
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Aquí se mostrarán los detalles completos del cliente.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminClientDetailPage;
