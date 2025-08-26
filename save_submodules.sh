#!/bin/bash

# Submódulos donde tocaste cosas
SUBS=(
  packages-src/be.this
  packages-src/this.audio
  packages-src/this.be
  packages-src/this.dictionary
  packages-src/this.DOM
  packages-src/this.env
  packages-src/this.GUI
  packages-src/this.img
  packages-src/this.me
  packages-src/this.pixel
  packages-src/this.text
  packages-src/this.video
  packages-src/this.wallet
  packages-src/this.dir
  packages-src/this.document
  packages-src/this.blockchain
  packages-src/this.url
)

# Crear rama temporal y subirla a origin
for p in "${SUBS[@]}"; do
  echo "==> $p"
  (
    cd "$p" \
    && git fetch origin \
    && BR="save-$(date +%Y%m%d-%H%M%S)" \
    && git switch -c "$BR" \
    && git push -u origin "$BR" \
    && echo "   ✅ Guardado en rama $BR y subido"
  )
done
