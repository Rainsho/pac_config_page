export async function register() {
  console.log(new Date().toLocaleString(), 'app started at port', process.env.PORT || 3000);

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startTraceSchedule } = await import('./lib/trace-ip');
    startTraceSchedule();
  }
}
