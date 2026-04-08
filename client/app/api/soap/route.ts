import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { action, xml } = (await req.json()) as {
      action: string;
      xml: string;
    };

    const response = await fetch('http://localhost:3001/shipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: `"${action}"`,
      },
      body: xml,
    });

    const responseXml = await response.text();

    return NextResponse.json(
      {
        ok: response.ok,
        status: response.status,
        responseXml,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Erro ao chamar SOAP',
      },
      { status: 500 },
    );
  }
}