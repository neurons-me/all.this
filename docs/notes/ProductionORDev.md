
Tu archivo .env:
ENV=development

Solo necesitas cambiarlo a:
ENV=production

cuando vayas a producción, y tu código detectará automáticamente el entorno correcto. Asegúrate de que estás cargando .env al inicio de tu aplicación con:
import 'dotenv/config';

¡Con eso ya tienes un entorno flexible y controlado! 