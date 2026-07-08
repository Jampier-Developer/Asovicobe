# Asovicobe Vigilancia — Control de Turnos

App web para registrar turnos de vigilancia, calcular el pago automáticamente según el tipo de día y horario, y llevar el control de turnos completados, pendientes y el total ganado.

🔗 **Demo en vivo:** https://asovicobe.pages.dev/

## Funcionalidades

- Registro de turnos por día, fecha y horario.
- Cálculo automático del pago estimado antes de guardar.
- Vista previa del pago según el tipo de día seleccionado.
- Panel de estadísticas: total de turnos, total ganado, completados y pendientes (del mes actual).
- Historial mensual automático: al cambiar de mes, el mes anterior se archiva solo, agrupado y con su propio subtotal — nunca se borra.
- Marcar turnos como completados/pendientes.
- Eliminar turnos agregados por el usuario.
- Diseño responsive (móvil, tablet y escritorio).

## Reglas de pago

| Tipo de día                        | Pago     |
|-------------------------------------|----------|
| Domingo o festivo                   | $100.000 |
| Sábado                              | $40.000  |
| Lunes a viernes (día normal)        | $20.000  |

Domingo, festivo y sábado son automáticos. Los días normales (lunes a viernes) pueden variar según cuántos se trabajen en la misma semana, así que ese caso admite un monto manual por turno en vez de un cálculo fijo.

## Stack

HTML, CSS y JavaScript puro — sin frameworks ni dependencias de build. Iconos de [Font Awesome](https://fontawesome.com/) y tipografía [Poppins](https://fonts.google.com/specimen/Poppins) vía CDN.

```
index.html            estructura principal de la página
css/Asovicobe.css      estilos (tema negro y rojo, glassmorphism)
js/Asovicobe.js        lógica de la aplicación
img/                   logo y fondo
```

Los datos que ingresa cada usuario se guardan en el `localStorage` del navegador — no hay backend ni base de datos.

## Desarrollo local

No requiere instalación ni build. Basta con abrir `index.html` en el navegador, o servirlo con cualquier servidor estático:

```bash
npx serve .
```

## Despliegue

El sitio se despliega automáticamente en [Cloudflare Pages](https://pages.cloudflare.com/) con cada push a la rama `main` del repositorio.

## Autor

Desarrollado por **Jampier Estrada**.
