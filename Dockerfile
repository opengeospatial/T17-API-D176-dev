FROM centos:8 as builder

COPY . /src
WORKDIR /src/local_packages/WebWorldWind-OGCTB17

RUN yum -y install wget unzip nodejs

RUN wget https://chromedriver.storage.googleapis.com/2.40/chromedriver_linux64.zip
RUN unzip chromedriver_linux64.zip

RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
RUN yum -y install google-chrome-stable_current_x86_64.rpm

RUN npm install && npm run build && npm link
WORKDIR /src

RUN npm install
RUN npm link worldwind-ogctb17
RUN npm run build --prod

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/
COPY --from=builder /src/dist /files/dist
