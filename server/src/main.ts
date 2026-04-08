import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ShipmentService } from './shipment/shipment.service';
import * as soap from 'soap';
import * as fs from 'fs';
import * as http from 'http';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const shipmentService = app.get(ShipmentService);

  const wsdl = fs.readFileSync('./shipment.wsdl', 'utf8');

  const service = {
    ShipmentService: {
      ShipmentPort: {
        criarRemessa: (args: unknown) =>
          shipmentService.criarRemessa(
            args as Parameters<ShipmentService['criarRemessa']>[0],
          ),

        consultarRemessa: (args: unknown) =>
          shipmentService.consultarRemessa(
            args as Parameters<ShipmentService['consultarRemessa']>[0],
          ),

        atualizarStatus: (args: unknown) =>
          shipmentService.atualizarStatus(
            args as Parameters<ShipmentService['atualizarStatus']>[0],
          ),

        listarRemessas: (args: unknown) =>
          shipmentService.listarRemessas(
            args as Parameters<ShipmentService['listarRemessas']>[0],
          ),
      },
    },
  };

  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, SOAPAction');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    res.statusCode = 404;
    res.end('Use /shipment ou /shipment?wsdl');
  });

  const soapServer = soap.listen(server, '/shipment', service, wsdl);

  soapServer.log = (type, data) => {
    console.log(type, data);
  };

  soapServer.authorizeConnection = () => {
    return true;
  };

  server.listen(3001, () => {
    console.log('SOAP server rodando em http://localhost:3001/shipment');
    console.log('WSDL em http://localhost:3001/shipment?wsdl');
  });
}

void bootstrap();