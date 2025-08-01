FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y curl gnupg git
RUN apt-get install -y python3 python3-pip python3-venv python3-pandas python3-astroid

RUN curl -sL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install -y nodejs
RUN node -v && npm -v

WORKDIR /app

COPY . /app

RUN npm install
RUN npm audit fix
RUN npx prisma migrate dev --name init
RUN npm run build

RUN git clone https://github.com/rmxvrelease/susd.git

EXPOSE 3003

CMD ["npm", "start"]
