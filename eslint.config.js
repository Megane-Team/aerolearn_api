// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    stylistic.configs.customize({
        flat: true,
        semi: true,
        quotes: "double",
        indent: 4,
        commaDangle: "never"
    }),
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ["*.config.js", "*.config.ts"]
                }
            }
        }
    }
);
