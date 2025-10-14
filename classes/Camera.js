// jbGame/engine/core/Camera.js

export class Camera {
    /**
     * Kamera gry — śledzi obiekt (np. gracza), porusza się płynnie i ogranicza do świata gry.
     */
    constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
        this.x = 0;
        this.y = 0;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;

        this.margin = 300; // jak daleko gracz może się oddalić od środka, zanim kamera ruszy
        this.center = { x: viewportWidth / 2, y: viewportHeight / 2 };

        this.target = null; // śledzony obiekt (np. gracz)
        this.mode = "follow"; // tryb pracy kamery: follow, moveTo, shake

        // Efekty
        this.shakeTime = 0;
        this.shakePower = 0;
        this.shakeOffset = { x: 0, y: 0 };

        // Cinematic movement
        this.moveToTarget = null;
        this.moveSpeed = 0;
    }

    /** Ustaw, który obiekt kamera ma śledzić (np. gracza) */
    follow(target) {
        this.target = target;
        this.mode = "follow";
    }

    /** Natychmiast ustaw kamerę na celu (np. po respawnie) */
    snapToTarget(mode = "platformer") {
        if (!this.target) return;
        if (mode === "platformer") {
            this.x = this.target.center.x - this.viewportWidth / 2;
            this.y = this.target.center.y - this.viewportHeight / 2;
        } else {
            this.x = this.target.center.x - this.viewportWidth / 2;
            this.y = this.target.center.y - this.viewportHeight / 2;
        }
        this.clamp();
    }

    /** Uruchamia płynny ruch kamery w stronę punktu (x, y) */
    moveTo(x, y, speed = 5) {
        this.moveToTarget = { x, y };
        this.moveSpeed = speed;
        this.mode = "moveTo";
    }

    /** Efekt drgania kamery — np. przy kolizji lub eksplozji */
    shake(duration = 400, power = 10) {
        this.shakeTime = duration;
        this.shakePower = power;
    }

    /**
    * Efekt drgania kamery z płynnym wygaszaniem (fade-out)
    * @param {number} duration - czas w ms
    * @param {number} power - maksymalna siła drgań
    */
    shakeSmooth(duration = 600, power = 10) {
        this.shakeTime = duration;
        this.shakePower = power;
        this.shakeFade = true; // 🔹 flaga aktywująca fade-out
    }


    /**
     * Aktualizacja położenia kamery (każda klatka)
     * @param {number} dt - deltaTime (sekundy)
     * @param {string} mode - tryb gry: "platformer" | "topdown"
     */
    update(dt, mode = "platformer") {
        // 🔹 0️⃣ Zabezpieczenie — brak celu
        if (!this.target) return;

        // 🔹 1️⃣ Ustal pozycję środka celu (działa i dla gracza, i dla edytora)
        const targetCenterX = this.target.center
            ? this.target.center.x
            : this.target.x + (this.target.width || 0) / 2;
        const targetCenterY = this.target.center
            ? this.target.center.y
            : this.target.y + (this.target.height || 0) / 2;

        // 🔹 2️⃣ Tryb śledzenia celu
        if (this.mode === "follow") {
            if (mode === "platformer") {
                this.x += (this.target.x - this.x - this.margin) * 0.1;
                this.y += (targetCenterY - this.y - this.viewportHeight / 2) * 0.1;
            } else {
                this.x += (targetCenterX - this.x - this.viewportWidth / 2) * 0.1;
                this.y += (targetCenterY - this.y - this.viewportHeight / 2) * 0.1;
            }
        }
        if (this.mode === "manual") {
            this.clamp();
            return;
        }
        // 🔹 3️⃣ Tryb cinematic (moveTo)
        if (this.mode === "moveTo" && this.moveToTarget) {
            this.x += (this.moveToTarget.x - this.x) / this.moveSpeed;
            this.y += (this.moveToTarget.y - this.y) / this.moveSpeed;

            if (
                Math.abs(this.moveToTarget.x - this.x) < 2 &&
                Math.abs(this.moveToTarget.y - this.y) < 2
            ) {
                this.mode = "follow";
                this.moveToTarget = null;
            }
        }

        // 🔹 4️⃣ Ograniczenie do świata
        this.clamp();

        // 🔹 5️⃣ Efekt drgań
        if (this.shakeTime > 0) {
            this.shakeTime -= dt * 1000;
            let currentPower = this.shakePower;

            if (this.shakeFade) {
                const fadeRatio = Math.max(0, this.shakeTime / 600);
                currentPower *= fadeRatio;
                if (this.shakeTime <= 0) this.shakeFade = false;
            }

            this.shakeOffset.x = (Math.random() - 0.5) * currentPower;
            this.shakeOffset.y = (Math.random() - 0.5) * currentPower;
        } else {
            this.shakeOffset.x = 0;
            this.shakeOffset.y = 0;
        }
    }

    // update(dt, mode = "platformer") {
    //     if (!this.target) return; // <— DODAJ TO!
    //     // 1️⃣ Tryb śledzenia gracza (płynne LERP)
    //     if (this.mode === "follow" && this.target) {
    //         if (mode === "platformer") {
    //             this.x += (this.target.x - this.x - this.margin) * 0.1;
    //             this.y += (this.target.center.y - this.y - this.viewportHeight / 2) * 0.1;
    //         } else {
    //             this.x += (this.target.center.x - this.x - this.viewportWidth / 2) * 0.1;
    //             this.y += (this.target.center.y - this.y - this.viewportHeight / 2) * 0.1;
    //         }
    //     }

    //     // 2️⃣ Tryb cinematic — automatyczny ruch kamery
    //     if (this.mode === "moveTo" && this.moveToTarget) {
    //         this.x += (this.moveToTarget.x - this.x) / this.moveSpeed;
    //         this.y += (this.moveToTarget.y - this.y) / this.moveSpeed;

    //         if (Math.abs(this.moveToTarget.x - this.x) < 2 && Math.abs(this.moveToTarget.y - this.y) < 2) {
    //             this.mode = "follow";
    //             this.moveToTarget = null;
    //         }
    //     }

    //     // 3️⃣ Ogranicz kamerę do granic świata
    //     this.clamp();

    //     // 4️⃣ Efekt drgania
    //     if (this.shakeTime > 0) {
    //         this.shakeTime -= dt * 1000;

    //         let currentPower = this.shakePower;

    //         // 🔹 Jeśli fade aktywny – siła maleje proporcjonalnie do czasu
    //         if (this.shakeFade) {
    //             const fadeRatio = Math.max(0, this.shakeTime / 600); // im bliżej końca, tym mniejsze drgania
    //             currentPower *= fadeRatio;
    //             if (this.shakeTime <= 0) this.shakeFade = false;
    //         }

    //         this.shakeOffset.x = (Math.random() - 0.5) * currentPower;
    //         this.shakeOffset.y = (Math.random() - 0.5) * currentPower;
    //     } else {
    //         this.shakeOffset.x = 0;
    //         this.shakeOffset.y = 0;
    //     }

    // }

    /** Zastosuj transformację kamery do kontekstu rysowania */
    apply(ctx) {
        ctx.translate(-this.x + this.shakeOffset.x, -this.y + this.shakeOffset.y);
    }

    /** Zabezpieczenie przed wyjechaniem kamery poza świat gry */
    clamp() {
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x > this.worldWidth - this.viewportWidth)
            this.x = this.worldWidth - this.viewportWidth;
        if (this.y > this.worldHeight - this.viewportHeight)
            this.y = this.worldHeight - this.viewportHeight;
    }
}
