#  Servidor de pruebas para sistema de telemetría

Implementación de un servidor de prueba muy sencillo para conectar con él el sistema de telemetría desarrollado en la práctica 3 de Usabilidad y Análisis de Juegos. Está implementado en Node con una base de datos en MongoDB y guarda en un fichero las trazas de telemetría que se van enviando.

En lugar de recibir los eventos de manera individual se espera que las trazas se envíen en formato JSON como una lista de objetos, cada uno de los cuales representa un evento. 

El servidor es _ad-hoc_ para la asignatura de Usabilidad y Análisis de Videojuegos por lo que actualmente se crea un espacio de guardado para cada uno de los 8 grupos que, tradicionalmente, están en la asignatura. El acceso al servidor se hace mediante una API web muy sencilla, con solo un endpoint para el guardado y acceso a las trazas de cada uno de los grupos. Como medida de seguridad, el endpoint de cada grupo está protegido por una clave que se dará a los grupos en clase. Esta clave se ha de pasar en la cabecera `authorization` como un Bearer token para poder acceder al endpoint de cada grupo. En el archivo `request.http` se pueden ver ejemplos de uso de la API y qué cabeceras son necesarias en las peticiones a la API.

**NOTA DE SEGURIDAD**: El servidor está implementado usando HTTP lo cual significa que las cabeceras (y, por tanto, la clave) irán en plano, lo que supone una brecha de seguridad. Se espera que este servidor se monte tras un proxy inverso que se encargue de la parte de dar soporte a HTTPS (SSL Proxy). **Este servidor es solo para hacer pruebas para la práctica. No es seguro por lo que no es conveniente usarlo en producción.**

## Servicios

En desarrollo, el servidor queda a la escucha en `localhost:8080`. Hay un punto de acceso con el que enviar nuevas trazas y ver las trazas almacenadas:

- GET `localhost:8080/telemetry/grupoXX`: devuelve una lista con las trazas almacenadas para el `grupoXX`
- POST `localhost:8080/telemetry/grupoXX`: almacena las trazas en el servidor para el `grupoXX`. La traza se ha de enviar como una lista de eventos en formato `application/json`, es decir, con un aspecto como el siguiente:

```
[ { ... }, { ... } ]
```

## Despliegue

El servidor se puede desplegar usando Docker. Previamente, es necesario crear un archivo `.env` a partir del archivo `template.env`. En es archivo hay documentación detallada de las variables de entorno que se usan.

Una vez creado el archivo `.env` se puede realizar el despliegue con: 

```
docker compose build
docker compose up
```

