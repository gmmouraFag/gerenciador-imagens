# Gerenciador de imagens — FastAPI + React + MySQL

Aplicação para enviar imagens, gravá-las como BLOB no MySQL, listar os registros e pré-visualizá-los.

## 1. Criar o banco

No MySQL Workbench, execute:

```sql
CREATE DATABASE image_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 2. Backend

No PowerShell, dentro de `backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

O `.env.example` já está configurado para a instância local informada (`root/root`, porta `3306`). Altere-o apenas se o seu MySQL usar outro host, porta ou senha.

API e documentação: <http://localhost:8000/docs>

## 3. Frontend

Em outro PowerShell, dentro de `frontend`:

```powershell
npm install
npm run dev
```

Abra o endereço exibido pelo Vite (normalmente <http://localhost:5173>). O frontend já está configurado para conversar com `http://localhost:8000`.

## Endpoints

- `POST /images` — recebe o campo `file` em `multipart/form-data`.
- `GET /images` — lista id, nome, tipo e data de envio.
- `GET /images/{id}/content` — retorna os bytes da imagem para exibição.
