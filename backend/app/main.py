import os
from datetime import datetime

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Image

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Image Manager API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    # O Vite muda de porta quando a 5173 já está ocupada.
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE_BYTES", "5242880"))


def image_summary(image: Image) -> dict:
    return {
        "id": image.id,
        "filename": image.filename,
        "content_type": image.content_type,
        "created_at": image.created_at,
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/images", status_code=status.HTTP_201_CREATED)
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Envie somente arquivos de imagem.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="O arquivo está vazio.")
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"A imagem deve ter no máximo {MAX_FILE_SIZE // 1024 // 1024} MB.",
        )

    image = Image(filename=file.filename or "imagem", content_type=file.content_type, data=data)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image_summary(image)


@app.get("/images")
def list_images(db: Session = Depends(get_db)):
    images = db.scalars(select(Image).order_by(Image.created_at.desc())).all()
    return [image_summary(image) for image in images]


@app.get("/images/{image_id}/content")
def get_image_content(image_id: int, db: Session = Depends(get_db)):
    image = db.get(Image, image_id)
    if image is None:
        raise HTTPException(status_code=404, detail="Imagem não encontrada.")
    return Response(content=image.data, media_type=image.content_type)
