export class GameMod {
  lastFrameTime: number;
  frameCount: number;
  fps: number;
  kills: number;
  isFpsUncapped: boolean;
  isFpsVisible: boolean;
  isKillsVisible: boolean;
  isMenuVisible: boolean;
  fpsCounter!: HTMLElement | null;
  killsCounter!: HTMLElement | null;
  animationFrameCallback: (callback: () => void) => void;

  constructor() {
      this.lastFrameTime = performance.now();
      this.frameCount = 0;
      this.fps = 0;
      this.kills = 0;
      this.isFpsUncapped = true;
      this.isFpsVisible = true;
      this.isKillsVisible = true;
      this.isMenuVisible = true;

      this.animationFrameCallback = (callback: () => void) => setTimeout(callback, 1);

      this.initFpsCounter();
      this.initKillsCounter();
      this.startUpdateLoop();
      this.setupWeaponBorderHandler();
  }

  initFpsCounter() {
      this.fpsCounter = document.createElement("div");
      this.fpsCounter.id = "fpsCounter";
      Object.assign(this.fpsCounter.style, {
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          padding: "5px 10px",
          marginTop: "10px",
          borderRadius: "5px",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          zIndex: "10000",
          pointerEvents: "none",
      });

      const uiTopLeft = document.getElementById("ui-top-left");
      if (uiTopLeft) {
          uiTopLeft.appendChild(this.fpsCounter);
      }

      this.updateFpsVisibility();
  }


  initKillsCounter() {
      this.killsCounter = document.createElement("div");
      this.killsCounter.id = "killsCounter";
      Object.assign(this.killsCounter.style, {
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          padding: "5px 10px",
          marginTop: "10px",
          borderRadius: "5px",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          zIndex: "10000",
          pointerEvents: "none",
      });

      const uiTopLeft = document.getElementById("ui-top-left");
      if (uiTopLeft) {
          uiTopLeft.appendChild(this.killsCounter);
      }
      this.updateKillsVisibility();
  }

  updateFpsVisibility() {
      if (this.fpsCounter) {
          this.fpsCounter.style.display = this.isFpsVisible ? "block" : "none";
          this.fpsCounter.style.backgroundColor = this.isFpsVisible
              ? "rgba(0, 0, 0, 0.2)"
              : "transparent";
      }
  }


  updateKillsVisibility() {
      if (this.killsCounter) {
          this.killsCounter.style.display = this.isKillsVisible ? "block" : "none";
          this.killsCounter.style.backgroundColor = this.isKillsVisible
              ? "rgba(0, 0, 0, 0.2)"
              : "transparent";
      }
  }

  toggleFpsDisplay() {
      this.isFpsVisible = !this.isFpsVisible;
      this.updateFpsVisibility();
  }

  toggleKillsDisplay() {
      this.isKillsVisible = !this.isKillsVisible;
      this.updateKillsVisibility();
  }

  getKills(): number {
      const killElement = document.querySelector(
          ".ui-player-kills.js-ui-player-kills",
      ) as HTMLElement;
      if (killElement) {
          const kills = parseInt(killElement.textContent || "0", 10);
          return isNaN(kills) ? 0 : kills;
      }
      return 0;
  }

 
  setupWeaponBorderHandler() {
      const weaponContainers = Array.from(
          document.getElementsByClassName("ui-weapon-switch"),
      ) as HTMLElement[];
      weaponContainers.forEach((container) => {
          if (container.id === "ui-weapon-id-4") {
              container.style.border = "3px solid #2f4032";
          } else {
              container.style.border = "3px solid #FFFFFF";
          }
      });

      const weaponNames = Array.from(
          document.getElementsByClassName("ui-weapon-name"),
      ) as HTMLElement[];
      weaponNames.forEach((weaponNameElement) => {
          const weaponContainer = weaponNameElement.closest(".ui-weapon-switch") as HTMLElement;
          const observer = new MutationObserver(() => {
              const weaponName = weaponNameElement.textContent?.trim() || "";
              let border = "#FFFFFF";

              switch (weaponName.toUpperCase()) {
                                //yellow
              case "CZ-3A1": case "G18C": case "M9": case "M93R": case "MAC-10": case "MP5": case "P30L": case "DUAL P30L": case "UMP9": case "VECTOR": case "VSS": case "FLAMETHROWER": border = "#FFAE00"; break;
              //blue 
              case "AK-47": case "OT-38": case "OTS-38": case "M39 EMR": case "DP-28": case "MOSIN-NAGANT": case "SCAR-H": case "SV-98": case "M1 GARAND": case "PKP PECHENEG": case "AN-94": case "BAR M1918": case "BLR 81": case "SVD-63": case "M134": case "GROZA": case "GROZA-S": border = "#007FFF"; break;
              //green
              case "FAMAS": case "M416": case "M249": case "QBB-97": case "MK 12 SPR": case "M4A1-S": case "SCOUT ELITE": case "L86A2": border = "#0f690d"; break;
              //red 
              case "M870": case "MP220": case "SAIGA-12": case "SPAS-12": case "USAS-12": case "SUPER 90": case "LASR GUN": case "M1100": border = "#FF0000"; break;
              //purple
              case "MODEL 94": case "PEACEMAKER": case "VECTOR (.45 ACP)": case "M1911": case "M1A1": border = "#800080"; break;
              //black
              case "DEAGLE 50": case "RAINBOW BLASTER": border = "#000000"; break;
              //olive
              case "AWM-S": case "MK 20 SSR": border = "#808000"; break; 
              //brown
              case "POTATO CANNON": case "SPUD GUN": border = "#A52A2A"; break;
              //other Guns
              case "FLARE GUN": border = "#FF4500"; break; case "M79": border = "#008080"; break; case "HEART CANNON": border = "#FFC0CB"; break; 
              default: border = "#FFFFFF"; break; }

              if (weaponContainer.id !== "ui-weapon-id-4") {
                  weaponContainer.style.border = `3px solid ${border}`;
              }
          });

          observer.observe(weaponNameElement, {
              childList: true,
              characterData: true,
              subtree: true,
          });
      });
  }

  updateUiElements() {
      const currentUrl = window.location.href;

      const isSpecialUrl = /\/#\w+/.test(currentUrl);

      const playerOptions = document.getElementById("player-options");
      const teamMenuContents = document.getElementById("team-menu-contents");
      const startMenuContainer = document.querySelector(
          "#start-menu .play-button-container",
      );

      if (!playerOptions) return;

      if (
          isSpecialUrl &&
          teamMenuContents &&
          playerOptions.parentNode !== teamMenuContents
      ) {
          teamMenuContents.appendChild(playerOptions);
      } else if (
          !isSpecialUrl &&
          startMenuContainer &&
          playerOptions.parentNode !== startMenuContainer
      ) {
          const firstChild = startMenuContainer.firstChild;
          startMenuContainer.insertBefore(playerOptions, firstChild);
      }
      const teamMenu = document.getElementById("team-menu");
      if (teamMenu) {
          teamMenu.style.height = "355px";
      }
      const menuBlocks = document.querySelectorAll<HTMLElement>(".menu-block");

    menuBlocks.forEach((block) => {
    if (block instanceof HTMLElement) {
        block.style.maxHeight = "355px";
    }
});
  }

  startUpdateLoop() {
      const now = performance.now();
      const delta = now - this.lastFrameTime;

      this.frameCount++;

      if (delta >= 1000) {
          this.fps = Math.round((this.frameCount * 1000) / delta);
          this.frameCount = 0;
          this.lastFrameTime = now;

          this.kills = this.getKills();

          if (this.isFpsVisible && this.fpsCounter) {
              this.fpsCounter.textContent = `FPS: ${this.fps}`;
          }

          if (this.isKillsVisible && this.killsCounter) {
              this.killsCounter.textContent = `Kills: ${this.kills}`;
          }

      }

      this.animationFrameCallback(() => this.startUpdateLoop());
      this.updateUiElements();
  }
}
