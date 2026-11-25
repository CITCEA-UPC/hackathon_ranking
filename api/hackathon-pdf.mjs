const source = 'https://raw.githubusercontent.com/CITCEA-UPC/VeraGrid_TenSyGrid/master/hackathon/';

const documents = new Map([
  ['organization', 'hackathon_organization.pdf'],
  ['schedule', 'hackathon_schedule.pdf'],
  ['warmup', 'participant_warmup.pdf'],
]);

export async function GET(request) {
  const document = new URL(request.url).searchParams.get('document');
  const filename = documents.get(document);

  if (!filename) {
    return new Response('Unknown hackathon document.', { status: 404 });
  }

  try {
    const upstream = await fetch(new URL(filename, source), {
      signal: AbortSignal.timeout(10_000),
    });

    if (upstream.ok && upstream.body) {
      return new Response(upstream.body, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }
  } catch (error) {
    console.error('Could not fetch hackathon PDF:', error);
  }

  return new Response('The hackathon document is temporarily unavailable.', {
    status: 502,
    headers: { 'Cache-Control': 'no-store' },
  });
}
