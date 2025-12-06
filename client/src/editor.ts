import $ from "jquery";
import { type GameObjectDef, GameObjectDefs } from "../../shared/defs/gameObjectDefs";
import { RoleDefs } from "../../shared/defs/gameObjects/roleDefs";
import { GameConfig } from "../../shared/gameConfig";
import { EditMsg } from "../../shared/net/editMsg";
import { math } from "../../shared/utils/math";
import { util } from "../../shared/utils/util";
import type { ConfigKey, ConfigManager } from "./config";
import { type InputHandler, Key } from "./input";
import type { Map } from "./map";
import type { Player } from "./objects/player";

const SPEED_DEFAULT = GameConfig.player.moveSpeed;

export class Editor {
    config: ConfigManager;
    enabled = false;
    zoom = GameConfig.scopeZoomRadius.desktop["1xscope"];
    loadNewMap = false;
    mapSeed = 0;
    printLootStats = false;
    spawnLootType = "";
    promoteToRoleType = "";
    speed = SPEED_DEFAULT;
    layer = 0;

    sendMsg = false;

    uiPos!: JQuery;
    uiZoom!: JQuery;
    uiMapSeed!: JQuery;

    uiLayerValueDisplay!: JQuery;
    /** differentiates between player movement vs manual toggle when changing layers */
    layerChangedByToggle = false;

    constructor(config: ConfigManager) {
        this.config = config;
        this.config.addModifiedListener(this.onConfigModified.bind(this));

        this.setEnabled(false);
    }

    onConfigModified(_key?: string) {
        this.refreshUi();
    }

    setEnabled(e: boolean) {
        this.enabled = e;
        this.refreshUi();
        if (e) this.sendMsg = true;
    }

    newMap(seed: number) {
        this.loadNewMap = true;
        this.mapSeed = Math.max(seed, 1);
        this.sendMsg = true;
    }

    refreshUi() {
        const e = this.enabled;

        $("#ui-editor").css("display", e ? "block" : "none");
        $("#ui-leaderboard-wrapper,#ui-right-center,#ui-kill-leader-container").css(
            "display",
            !e ? "block" : "none",
        );

        this.uiPos = $("<div/>");
        this.uiZoom = $("<div/>");

        const createButton = (text: string, fn: () => void) => {
            const btn = $("<div/>", {
                class: "btn-game-menu btn-darken",
                css: {
                    height: "30px",
                    "line-height": "28px",
                },
                html: text,
            });
            btn.on("click", (e) => {
                e.stopPropagation();
                fn();
            });
            return btn;
        };

        this.uiMapSeed = $("<div/>");
        const mapBtns = $("<div/>", {
            css: { display: "flex" },
        });
        mapBtns.append(
            createButton("<", () => {
                this.newMap(this.mapSeed - 1);
            }),
        );
        mapBtns.append($("<span/>", { css: { width: "12px" } }));
        mapBtns.append(
            createButton(">", () => {
                this.newMap(this.mapSeed + 1);
            }),
        );
        mapBtns.append($("<span/>", { css: { width: "12px" } }));
        mapBtns.append(
            createButton("?", () => {
                this.newMap(util.randomInt(1, 1 << 30));
            }),
        );

        const lootSummaryBtn = $("<div/>", {
            css: { display: "flex" },
        });
        lootSummaryBtn.append(
            createButton("Loot summary", () => {
                this.printLootStats = true;
                this.sendMsg = true;
            }),
        );

        // Build loot items list with categories
        const lootItems: Array<{ type: string; def: GameObjectDef; category: string }> = [];
        const categoryMap: Record<string, string> = {
            gun: "Guns",
            melee: "Melee",
            throwable: "Throwables",
            outfit: "Outfits",
            helmet: "Armor",
            chest: "Armor",
            backpack: "Gear",
            scope: "Gear",
            heal: "Consumables",
            boost: "Consumables",
            ammo: "Ammo",
            perk: "Perks",
            xp: "XP",
        };

        for (const [type, def] of Object.entries(GameObjectDefs)) {
            if (!("lootImg" in def)) continue;
            const category = categoryMap[def.type] || "Other";
            lootItems.push({ type, def, category });
        }

        // Sort by category then by name
        lootItems.sort((a, b) => {
            if (a.category !== b.category) {
                return a.category.localeCompare(b.category);
            }
            const nameA = ("name" in a.def ? a.def.name : a.type) || a.type;
            const nameB = ("name" in b.def ? b.def.name : b.type) || b.type;
            return nameA.localeCompare(nameB);
        });

        const createLootUi = $("<div/>", {
            css: {
                position: "relative",
                width: "100%",
            },
        });

        const label = $("<label/>", {
            text: "Loot:",
            css: {
                display: "block",
                "margin-bottom": "5px",
            },
        });
        createLootUi.append(label);

        // Search input container
        const searchContainer = $("<div/>", {
            css: {
                position: "relative",
                display: "flex",
                "align-items": "center",
            },
        });

        const searchInput = $("<input/>", {
            type: "text",
            placeholder: "Search loot items...",
            class: "editor-loot-search",
            css: {
                width: "100%",
                height: "30px",
                padding: "5px 30px 5px 10px",
                border: "1px solid #444",
                "background-color": "#1a1a1a",
                color: "#fff",
                "border-radius": "4px",
                "box-sizing": "border-box",
            },
        });

        // Search icon
        const searchIcon = $("<span/>", {
            html: "🔍",
            css: {
                position: "absolute",
                right: "8px",
                "pointer-events": "none",
                "font-size": "14px",
            },
        });
        searchContainer.append(searchInput);
        searchContainer.append(searchIcon);

        // Dropdown container
        const dropdownContainer = $("<div/>", {
            class: "editor-loot-dropdown",
            css: {
                display: "none",
                position: "absolute",
                top: "100%",
                left: "0",
                right: "0",
                "max-height": "300px",
                "overflow-y": "auto",
                "background-color": "#1a1a1a",
                border: "1px solid #444",
                "border-top": "none",
                "border-radius": "0 0 4px 4px",
                "z-index": "1000",
                "margin-top": "2px",
            },
        });

        // Items list
        const itemsList = $("<div/>", {
            class: "editor-loot-items",
        });

        let currentCategory = "";
        const renderItems = (filter: string = "") => {
            itemsList.empty();
            const filterLower = filter.toLowerCase();
            let hasVisibleItems = false;

            for (const item of lootItems) {
                const itemName = ("name" in item.def ? item.def.name : item.type) || item.type;
                const searchText = `${itemName} ${item.type} ${item.category}`.toLowerCase();

                if (filter && !searchText.includes(filterLower)) {
                    continue;
                }

                hasVisibleItems = true;

                // Category header
                if (item.category !== currentCategory) {
                    currentCategory = item.category;
                    const categoryHeader = $("<div/>", {
                        class: "editor-loot-category",
                        text: currentCategory,
                        css: {
                            padding: "8px 12px",
                            "background-color": "#2a2a2a",
                            color: "#aaa",
                            "font-weight": "bold",
                            "font-size": "12px",
                            "text-transform": "uppercase",
                            "border-bottom": "1px solid #333",
                        },
                    });
                    itemsList.append(categoryHeader);
                }

                // Item
                const itemElement = $("<div/>", {
                    class: "editor-loot-item",
                    css: {
                        padding: "8px 12px",
                        cursor: "pointer",
                        "border-bottom": "1px solid #2a2a2a",
                        display: "flex",
                        "justify-content": "space-between",
                        "align-items": "center",
                    },
                });

                const itemNameSpan = $("<span/>", {
                    text: itemName,
                    css: {
                        color: "#fff",
                        "font-size": "14px",
                    },
                });

                const itemTypeSpan = $("<span/>", {
                    text: item.type,
                    css: {
                        color: "#888",
                        "font-size": "11px",
                        "font-family": "monospace",
                    },
                });

                itemElement.append(itemNameSpan);
                itemElement.append(itemTypeSpan);

                // Hover effect
                itemElement.on("mouseenter", function () {
                    $(this).css("background-color", "#2a2a2a");
                });
                itemElement.on("mouseleave", function () {
                    $(this).css("background-color", "transparent");
                });

                // Click handler
                itemElement.on("click", (e) => {
                    e.stopPropagation();
                    searchInput.val(itemName);
                    this.spawnLootType = item.type;
                    this.sendMsg = true;
                    dropdownContainer.hide();
                });

                itemsList.append(itemElement);
            }

            if (!hasVisibleItems) {
                const noResults = $("<div/>", {
                    text: "No items found",
                    css: {
                        padding: "20px",
                        "text-align": "center",
                        color: "#888",
                    },
                });
                itemsList.append(noResults);
            }

            currentCategory = "";
        };

        // Initial render
        renderItems();

        dropdownContainer.append(itemsList);
        searchContainer.append(dropdownContainer);
        createLootUi.append(searchContainer);

        // Search input handlers
        searchInput.on("keydown", (e) => {
            e.stopImmediatePropagation();
            if (e.key === "Escape") {
                dropdownContainer.hide();
                searchInput.blur();
            }
        });

        searchInput.on("input", () => {
            const filter = searchInput.val() as string;
            renderItems(filter);
            dropdownContainer.show();
        });

        searchInput.on("focus", () => {
            dropdownContainer.show();
        });

        // Close dropdown when clicking outside
        $(document).on("click", (e) => {
            if (!searchContainer[0].contains(e.target as Node)) {
                dropdownContainer.hide();
            }
        });

        // Spawn button
        const spawnButtonContainer = $("<div/>", {
            css: {
                "margin-top": "10px",
                display: "flex",
                "align-items": "center",
            },
        });

        const spawnButton = createButton("Spawn Selected", () => {
            let selectedType = this.spawnLootType;
            
            // If no type is selected, try to find it from the search input
            if (!selectedType) {
                const searchValue = searchInput.val() as string;
                if (searchValue) {
                    // Try to find exact match by name first
                    for (const item of lootItems) {
                        const itemName = ("name" in item.def ? item.def.name : item.type) || item.type;
                        if (itemName.toLowerCase() === searchValue.toLowerCase()) {
                            selectedType = item.type;
                            break;
                        }
                    }
                    
                    // If no name match, try type match
                    if (!selectedType && GameObjectDefs[searchValue]) {
                        selectedType = searchValue;
                    }
                }
            }
            
            if (selectedType && GameObjectDefs[selectedType]) {
                this.spawnLootType = selectedType;
                this.sendMsg = true;
            }
        });
        spawnButton.css({
            width: "100%",
        });

        spawnButtonContainer.append(spawnButton);
        createLootUi.append(spawnButtonContainer);

        const createRoleUi = $("<div/>", {
            css: { display: "flex" },
        });
        const roleTypeDropdown = $<HTMLSelectElement>("<select/>", {
            css: {
                height: "30px",
                width: "180px",
                "line-height": "28px",
                "margin-top": "5px",
                "margin-bottom": "5px",
            },
        });

        const invalidRoleTypes = ["kill_leader", "the_hunted"];

        for (const [type, _def] of Object.entries(RoleDefs)) {
            if (invalidRoleTypes.includes(type)) continue;

            const opt = $<HTMLOptionElement>("<option/>", {
                value: type,
                html: type,
            });

            roleTypeDropdown.append(opt);
        }

        createRoleUi.append(roleTypeDropdown);
        createRoleUi.append($("<span/>", { css: { width: "12px" } }));
        createRoleUi.append(
            createButton("Promote To Role", () => {
                this.promoteToRoleType = roleTypeDropdown.val() as string;
                this.sendMsg = true;
            }),
        );

        const speedSliderContainer = $("<div/>", {
            css: { display: "flex", alignItems: "center" },
        });

        const speedSlider = $("<input/>", {
            type: "range",
            min: "1",
            max: "75",
            value: this.speed,
        });

        const ssValueDisplay = $("<span/>").text(this.speed);

        /** doesn't change the slider value */
        const setSpeed = (speed: number) => {
            this.speed = speed;
            ssValueDisplay.text(speed);
            this.sendMsg = true;
        };

        speedSlider.on("input", (e) => {
            e.stopPropagation();
            const target = $(e.target) as JQuery<HTMLInputElement>;
            setSpeed(Number(target.val()));
        });

        const speedSliderLabel = $("<label>", {
            text: "Speed:",
            for: speedSlider.attr("id"),
        });

        speedSliderContainer.append(speedSliderLabel);
        speedSliderContainer.append($("<span/>", { css: { width: "5px" } }));
        speedSliderContainer.append(ssValueDisplay);
        speedSliderContainer.append($("<span/>", { css: { width: "10px" } }));
        speedSliderContainer.append(speedSlider);
        speedSliderContainer.append($("<span/>", { css: { width: "10px" } }));
        speedSliderContainer.append(
            createButton("Reset", () => {
                speedSlider.val(SPEED_DEFAULT);
                setSpeed(SPEED_DEFAULT);
                this.sendMsg = true;
            }),
        );

        const layerToggleContainer = $("<div/>", {
            css: { display: "flex", alignItems: "center" },
        });

        const layerToggleValueDisplay = $("<span/>").text(this.layer);
        this.uiLayerValueDisplay = layerToggleValueDisplay;

        const layerToggle = createButton("Toggle Layer", () => {
            this.layer = util.toGroundLayer(this.layer) ^ 1;
            this.layerChangedByToggle = true;
            layerToggleValueDisplay.text(this.layer);
            this.sendMsg = true;
        });

        const layerToggleLabel = $("<label>", {
            text: "Layer:",
            for: layerToggle.attr("id"),
        });

        layerToggleContainer.append(layerToggleLabel);
        layerToggleContainer.append($("<span/>", { css: { width: "5px" } }));
        layerToggleContainer.append(layerToggleValueDisplay);
        layerToggleContainer.append($("<span/>", { css: { width: "10px" } }));
        layerToggleContainer.append(layerToggle);

        const createCheckbox = (_name: string, key: string) => {
            const check = $("<input/>", {
                type: "checkbox",
                value: "value",
                checked: this.config.get(key as ConfigKey),
            });
            check.on("click", (e) => {
                e.stopPropagation();

                const val = check.prop("checked");
                this.config.set(key as ConfigKey, val);
                this.sendMsg = true;
            });
            return check;
        };

        const createObjectUi = <T extends object = object>(obj: T, objKey: string) => {
            const parent = $("<ul/>", { class: "ui-editor-list" });
            if (objKey.split(".").length == 1) {
                parent.css("padding", "0px");
            }

            const keys = Object.keys(obj);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const val = obj[key as keyof T];
                const newKey = `${objKey}.${key}`;

                const elem = $("<li/>", { class: "ui-editor-list" });
                if (typeof val == "object") {
                    elem.html(`${key}`);
                    elem.append(createObjectUi(val as object, newKey));
                } else if (typeof val === "boolean") {
                    const check = createCheckbox(key, newKey);
                    const label = $("<div/>", {
                        css: { display: "inline-block" },
                        html: key,
                    });
                    elem.append(check);
                    elem.append(label);
                }
                parent.append(elem);
            }

            return parent;
        };

        const editorConfig = (this.config.get("debug" as ConfigKey) || {}) as object;
        const uiConfig = $("<div/>");
        uiConfig.append(createObjectUi(editorConfig, "debug"));

        // Ui
        const list = $("<div/>");
        list.append($("<li/>").append(this.uiPos));
        list.append($("<li/>").append(this.uiZoom));
        list.append($("<li/>").append($("<hr/>")));
        list.append($("<li/>").append(this.uiMapSeed));
        list.append($("<li/>").append(mapBtns));
        // list.append($("<li/>").append(lootSummaryBtn)); // not implemented yet
        list.append($("<li/>").append(createLootUi));
        list.append($("<li/>").append(createRoleUi));
        list.append($("<li/>").append(speedSliderContainer));
        list.append($("<li/>").append(layerToggleContainer));
        list.append($("<li/>").append($("<hr/>")));
        list.append($("<li/>").append(uiConfig));

        list.on("mousedown", (e) => {
            e.stopImmediatePropagation();
        });
        list.on("wheel", (e) => {
            e.stopImmediatePropagation();
        });

        $("#ui-editor-info-list").html(list as unknown as JQuery.Node);
    }

    m_update(_dt: number, input: InputHandler, player: Player, map: Map) {
        // Camera zoom
        if (input.keyPressed(Key.Plus)) {
            this.zoom -= 8.0;
            this.sendMsg = true;
        }
        if (input.keyPressed(Key.Minus)) {
            this.zoom += 8.0;
            this.sendMsg = true;
        }
        if (input.keyPressed(Key.Zero)) {
            this.zoom = player.m_getZoom();
            this.sendMsg = true;
        }
        this.zoom = math.clamp(this.zoom, 1.0, 255.0);

        //layer changed naturally so need to update the state + ui
        //used != instead of util.sameLayer() because we want every layer change not just ground-underground
        if (!this.layerChangedByToggle && this.layer != player.layer) {
            this.layerChangedByToggle = false;
            this.layer = player.layer;
            this.uiLayerValueDisplay.text(this.layer);
        }

        // Ui
        const posX = player.m_pos.x.toFixed(2);
        const posY = player.m_pos.y.toFixed(2);
        this.uiPos.html(`Pos:  ${posX}, ${posY}`);
        this.uiZoom.html(`Zoom: ${this.zoom}`);
        this.uiMapSeed.html(`Map seed: ${map.seed}`);

        if (!this.loadNewMap) {
            this.mapSeed = map.seed;
        }
    }

    getMsg() {
        const msg = new EditMsg();
        const debug = this.config.get("debug")!;
        msg.overrideZoom = debug.overrideZoom;
        msg.zoom = this.zoom;
        msg.speed = this.speed;
        msg.layer = this.layer;
        msg.cull = debug.cull;
        msg.printLootStats = this.printLootStats;
        msg.loadNewMap = this.loadNewMap;
        msg.newMapSeed = this.mapSeed;
        msg.spawnLootType = this.spawnLootType;
        msg.promoteToRoleType = this.promoteToRoleType;
        msg.spectatorMode = debug.spectatorMode;
        msg.godMode = debug.godMode;

        return msg;
    }

    postSerialization() {
        this.loadNewMap = false;
        this.printLootStats = false;
        this.spawnLootType = "";
        this.promoteToRoleType = "";
        this.layerChangedByToggle = false;
        this.sendMsg = false;
    }
}
