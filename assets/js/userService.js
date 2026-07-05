/**
 * ROBLOX IDENTITY SERVICE ENGINE
 * Core communication module that manages string syntax constraints and interfaces
 * with decentralized API gateways to resolve user identities and avatar headshots.
 *
 * @category  Front-end Core
 * @package   RobloxService
 * @author    Amarire Dev <contact@amarire.dev>
 * @homepage  https://amarire.dev
 * @license   MIT
 */

(() => {
    'use strict';

    const SECURE_GATEWAY_URL = "https://api.example.com/roblox-avatar";

    const RobloxService = {
        /**
         * Validates Roblox username syntax rules based on platform constraints.
         * @param {string} username - The raw username input to validate.
         * @returns {boolean} True if the syntax is valid, otherwise false.
         */
        validateSyntax(username) {
            if (!username) return false;
            if (username.length < 3 || username.length > 20) return false;
            if (!/^[a-zA-Z0-9_]+$/.test(username)) return false;
            if ((username.match(/_/g) || []).length > 1) return false;
            if (username.startsWith('_') || username.endsWith('_')) return false;
            return true;
        },

        /**
         * Performs the HTTP gateway request to resolve user metadata.
         * @private
         * @param {string} username - Pre-validated username.
         * @returns {Promise<Object>} Gateway payload parsing result.
         */
        async _fetchFromGateway(username) {
            const response = await fetch(`${SECURE_GATEWAY_URL}?username=${encodeURIComponent(username)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.status === 429) {
                return { success: false, error: "Rate limit exceeded." };
            }

            if (response.status === 400) {
                return { success: false, error: "Invalid username." };
            }

            if (response.status === 404) {
                return { success: false, error: "Username not found." };
            }

            if (!response.ok) {
                throw new Error("Network Error");
            }

            const jsonResponse = await response.json();

            if (!jsonResponse.success || !jsonResponse.data || !jsonResponse.data.imageUrl) {
                return { success: false, error: "Username not found." };
            }

            return {
                success: true,
                username: jsonResponse.data.username,
                avatarUrl: jsonResponse.data.imageUrl
            };
        },

        /**
         * Public API to verify syntax and fetch target Roblox profile assets.
         * @param {string} username - Target account username.
         * @returns {Promise<Object>} Unified response object containing success status or error details.
         */
        async verifyAndFetchProfile(username) {
            if (!this.validateSyntax(username)) {
                return { success: false, error: "Invalid username format." };
            }

            try {
                return await this._fetchFromGateway(username);
            } catch (err) {
                return { success: false, error: "Service unavailable." };
            }
        }
    };

    window.RobloxService = RobloxService;
})();