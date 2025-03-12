# Usa la imagen de Node.js 22.14.0
FROM node:22.14.0

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia solo los archivos de dependencias antes de instalar
COPY package.json yarn.lock ./

# Instala las dependencias
RUN yarn install --frozen-lockfile

# Copia el resto del código fuente al contenedor
COPY . .

COPY credentials/key.json /app/credentials/key.json

ENV GOOGLE_CREDENTIALS_PATH=/app/credentials/key.json

# Compila el código TypeScript
RUN yarn build

# Expone el puerto en el que corre la aplicación
EXPOSE 3000

# Comando para ejecutar la aplicación en modo producción
CMD ["yarn", "start"]
