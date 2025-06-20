import $ from "jquery";
import { api } from "./api";
import { helpers } from "./helpers";
import type { FindGameBody, FindGameError, FindGameMatchData, FindGameResponse } from "../../shared/types/api";
    
export class PrivateGame {
    private access_code_input = $("#private-game-code-input");
    private create_private_btn = $("#btn-create-private-game");
    private join_private_btn = $("#btn-join-private-game");

    constructor(
        private readonly config: any,
        private readonly localization: any,
        private readonly audioManager: any,
        private readonly findGameCallback: (
            matchArgs: FindGameBody,
            callback: (err?: FindGameError | null, matchData?: FindGameMatchData, ban?: FindGameResponse & { banned: true }) => void
        ) => void
    ) {
        this.initialize();
    }

    private initialize(): void {
        // Set up event listeners for private game buttons
        this.create_private_btn.on("click", () => {
            this.createPrivateGame();
        });

        this.join_private_btn.on("click", () => {
            this.joinPrivateGame();
        });

        // Initialize input field behavior
        this.access_code_input.on("input", () => {
            this.validateAccessCode();
        });

        this.access_code_input.on("keypress", (e) => {
            if (e.which === 13) { // Enter key
                const code = this.access_code_input.val() as string;
                if (code && code.trim().length > 0) {
                    this.joinPrivateGame();
                }
                e.preventDefault();
            }
        });

        // Initial validation
        this.validateAccessCode();
    }

    private validateAccessCode(): void {
        const code = this.access_code_input.val() as string;
        const isValid = code && code.trim().length > 0;
        
        // Enable/disable join button based on input
        if (isValid) {
            this.join_private_btn.removeClass("btn-disabled");
        } else {
            this.join_private_btn.addClass("btn-disabled");
        }
    }

    private createPrivateGame(): void {
        // Generate a random 6-character access code
        const accessCode = this.generateAccessCode();
        
        // Play button sound
        this.audioManager.playSound("button_click", {});
        
        // Create a private game with the generated access code
        const matchArgs: FindGameBody = {
            region: this.config.get("region"),
            zones: [],
            version: 1,
            gameModeIdx: 0,
            teamMode: 0, // Solo mode by default
            autoFill: true,
            playerCount: 1,
            playerData: [helpers.random64()],
            createPrivate: true,
            isPrivate: true,
            accessCode: accessCode
        };

        this.findGameCallback(matchArgs, (err, matchData) => {
            if (err) {
                console.error("Failed to create private game:", err);
                // Show error to user
                return;
            }
            
            // Game created successfully
            console.log("Private game created with code:", accessCode);
            // The game will be joined automatically by the main game code
        });
    }

    private joinPrivateGame(): void {
        const accessCode = this.access_code_input.val() as string;
        
        if (!accessCode || accessCode.trim().length === 0) {
            return;
        }
        
        // Play button sound
        this.audioManager.playSound("button_click", {});
        
        // Join the private game with the provided access code
        const matchArgs: FindGameBody = {
            region: this.config.get("region"),
            zones: [],
            version: 1,
            gameModeIdx: 0,
            teamMode: 0, // Solo mode by default
            autoFill: true,
            playerCount: 1,
            playerData: [helpers.random64()],
            isPrivate: true,
            accessCode: accessCode
        };

        this.findGameCallback(matchArgs, (err, matchData) => {
            if (err) {
                console.error("Failed to join private game:", err);
                // Show error to user
                return;
            }
            
            // Game joined successfully
            console.log("Joined private game with code:", accessCode);
            // The game will be joined automatically by the main game code
        });
    }

    private generateAccessCode(): string {
        // Generate a random 6-character alphanumeric code
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking characters
        let code = "";
        
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            code += chars.charAt(randomIndex);
        }
        
        return code;
    }
}
