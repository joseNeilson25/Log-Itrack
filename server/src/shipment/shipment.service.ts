import { Injectable } from '@nestjs/common';
import {
  AtualizarStatusArgs,
  ConsultarRemessaArgs,
  CriarRemessaArgs,
  ListarRemessasArgs,
  Remessa,
  ShipmentStatus,
} from './shipment.types';

@Injectable()
export class ShipmentService {
  private readonly remessas = new Map<string, Remessa>();

  private readonly statusValidos: ShipmentStatus[] = [
    'AGUARDANDO',
    'EM_TRANSITO',
    'ENTREGUE',
    'CANCELADO',
  ];

  private createSoapFault(faultName: string, message: string) {
    return {
      Fault: {
        Code: {
          Value: 'SOAP-ENV:Client',
        },
        Reason: {
          Text: message,
        },
        Detail: {
          faultName,
        },
      },
    };
  }

  private gerarId(): string {
    return `REM-${Date.now()}`;
  }

  private validarTextoObrigatorio(valor: unknown, nomeCampo: string): string {
    if (typeof valor !== 'string' || valor.trim() === '') {
      throw this.createSoapFault(
        'ValidacaoFault',
        `${nomeCampo} é obrigatório`,
      );
    }

    return valor.trim();
  }

  private validarPesoKg(valor: unknown): number {
    const peso = Number(valor);

    if (!Number.isFinite(peso) || peso <= 0) {
      throw this.createSoapFault(
        'ValidacaoFault',
        'pesoKg deve ser um número maior que zero',
      );
    }

    return peso;
  }

  private validarStatus(valor: unknown): ShipmentStatus {
    if (typeof valor !== 'string') {
      throw this.createSoapFault(
        'StatusInvalidoFault',
        'status inválido',
      );
    }

    if (!this.statusValidos.includes(valor as ShipmentStatus)) {
      throw this.createSoapFault(
        'StatusInvalidoFault',
        `status inválido. Use: ${this.statusValidos.join(', ')}`,
      );
    }

    return valor as ShipmentStatus;
  }

  private buscarRemessaPorId(remessaId: unknown): Remessa {
    const id = this.validarTextoObrigatorio(remessaId, 'remessaId');
    const remessa = this.remessas.get(id);

    if (!remessa) {
      throw this.createSoapFault(
        'RemessaNaoEncontradaFault',
        'Remessa não encontrada',
      );
    }

    return remessa;
  }

  criarRemessa(args: CriarRemessaArgs) {
    const clienteId = this.validarTextoObrigatorio(args.clienteId, 'clienteId');
    const origem = this.validarTextoObrigatorio(args.origem, 'origem');
    const destino = this.validarTextoObrigatorio(args.destino, 'destino');
    const descricao = this.validarTextoObrigatorio(args.descricao, 'descricao');
    const pesoKg = this.validarPesoKg(args.pesoKg);

    const id = this.gerarId();
    const criadoEm = new Date().toISOString();

    const remessa: Remessa = {
      id,
      clienteId,
      origem,
      destino,
      pesoKg,
      descricao,
      status: 'AGUARDANDO',
      criadoEm,
      historico: [
        {
          status: 'AGUARDANDO',
          data: criadoEm,
        },
      ],
    };

    this.remessas.set(id, remessa);

    return {
      remessaId: remessa.id,
      status: remessa.status,
      criadoEm: remessa.criadoEm,
    };
  }

  consultarRemessa(args: ConsultarRemessaArgs) {
    const remessa = this.buscarRemessaPorId(args.remessaId);

    return {
      remessaId: remessa.id,
      clienteId: remessa.clienteId,
      origem: remessa.origem,
      destino: remessa.destino,
      pesoKg: remessa.pesoKg,
      descricao: remessa.descricao,
      status: remessa.status,
      criadoEm: remessa.criadoEm,
      historico: {
        item: remessa.historico.map((registro) => ({
          status: registro.status,
          data: registro.data,
        })),
      },
    };
  }

  atualizarStatus(args: AtualizarStatusArgs) {
    const remessa = this.buscarRemessaPorId(args.remessaId);
    const novoStatus = this.validarStatus(args.status);

    remessa.status = novoStatus;

    const atualizadoEm = new Date().toISOString();

    remessa.historico.push({
      status: novoStatus,
      data: atualizadoEm,
    });

    this.remessas.set(remessa.id, remessa);

    return {
      remessaId: remessa.id,
      status: remessa.status,
      atualizadoEm,
    };
  }

  listarRemessas(args: ListarRemessasArgs) {
    const statusFiltro =
      typeof args.status === 'string' && args.status.trim() !== ''
        ? args.status.trim()
        : undefined;

    const clienteIdFiltro =
      typeof args.clienteId === 'string' && args.clienteId.trim() !== ''
        ? args.clienteId.trim()
        : undefined;

    if (statusFiltro) {
      this.validarStatus(statusFiltro);
    }

    const pagina = Number(args.pagina ?? 1);
    const tamanhoPagina = Number(args.tamanhoPagina ?? 10);

    if (!Number.isInteger(pagina) || pagina <= 0) {
      throw this.createSoapFault(
        'ValidacaoFault',
        'pagina deve ser um inteiro maior que zero',
      );
    }

    if (!Number.isInteger(tamanhoPagina) || tamanhoPagina <= 0) {
      throw this.createSoapFault(
        'ValidacaoFault',
        'tamanhoPagina deve ser um inteiro maior que zero',
      );
    }

    let itens = Array.from(this.remessas.values());

    if (statusFiltro) {
      itens = itens.filter((remessa) => remessa.status === statusFiltro);
    }

    if (clienteIdFiltro) {
      itens = itens.filter((remessa) => remessa.clienteId === clienteIdFiltro);
    }

    const total = itens.length;
    const inicio = (pagina - 1) * tamanhoPagina;
    const fim = inicio + tamanhoPagina;
    const paginaItens = itens.slice(inicio, fim);

    return {
      pagina,
      tamanhoPagina,
      total,
      remessas: {
        item: paginaItens.map((remessa) => ({
          remessaId: remessa.id,
          clienteId: remessa.clienteId,
          origem: remessa.origem,
          destino: remessa.destino,
          pesoKg: remessa.pesoKg,
          descricao: remessa.descricao,
          status: remessa.status,
          criadoEm: remessa.criadoEm,
        })),
      },
    };
  }
}