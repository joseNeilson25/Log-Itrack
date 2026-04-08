import { Module } from '@nestjs/common';
import { ShipmentService } from './shipment/shipment.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ShipmentService],
})
export class AppModule {}