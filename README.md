# Insulog Web
Repositório da página principal do médico

Insulog Mobile ( Paciente ) em:
https://github.com/Yan-Reule/insulog-mobile-front

## Conexão com a API

Em desenvolvimento, `npm run dev` encaminha as chamadas `/api` para o backend no Render.
Para apontar para outra API durante o desenvolvimento, defina `VITE_API_URL` no ambiente
antes de iniciar o Vite; sem essa variável, o proxy local é usado.

Na build de produção, a API padrão é `https://insulog-back-supa.onrender.com`.
Para trocar o endereço, configure a variável `VITE_API_URL` no serviço que gera/publica
o front-end e faça uma nova build. Como a chamada em produção é feita diretamente do
navegador para outro domínio, o backend também precisa permitir o domínio do front-end
na configuração de CORS.

```sh
npm install
npm run dev
```
