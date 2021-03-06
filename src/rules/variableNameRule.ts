/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const OPTION_LEADING_UNDERSCORE = "allow-leading-underscore";
const OPTION_TRAILING_UNDERSCORE = "allow-trailing-underscore";

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "variable name must be in camelcase or uppercase";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const variableNameWalker = new VariableNameWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(variableNameWalker);
    }
}

class VariableNameWalker extends Lint.RuleWalker {
    public visitBindingElement(node: ts.BindingElement) {
        if (node.name.kind === ts.SyntaxKind.Identifier) {
            this.handleVariableName(<ts.Identifier> node.name);
        }
        super.visitBindingElement(node);
    }

    public visitParameterDeclaration(node: ts.ParameterDeclaration) {
        if (node.name.kind === ts.SyntaxKind.Identifier) {
            this.handleVariableName(<ts.Identifier> node.name);
        }
        super.visitParameterDeclaration(node);
    }

    public visitPropertyDeclaration(node: ts.PropertyDeclaration) {
        if (node.name != null && node.name.kind === ts.SyntaxKind.Identifier) {
            this.handleVariableName(<ts.Identifier> node.name);
        }
        super.visitPropertyDeclaration(node);
    }

    public visitVariableDeclaration(node: ts.VariableDeclaration) {
        if (node.name.kind === ts.SyntaxKind.Identifier) {
            this.handleVariableName(<ts.Identifier> node.name);
        }
        super.visitVariableDeclaration(node);
    }

    public visitVariableStatement(node: ts.VariableStatement) {
        // skip 'declare' keywords
        if (!Lint.hasModifier(node.modifiers, ts.SyntaxKind.DeclareKeyword)) {
            super.visitVariableStatement(node);
        }
    }

    private handleVariableName(name: ts.Identifier) {
        const variableName = name.text;

        if (!this.isCamelCase(variableName) && !this.isUpperCase(variableName)) {
            this.addFailure(this.createFailure(name.getStart(), name.getWidth(), Rule.FAILURE_STRING));
        }
    }

    private isCamelCase(name: string) {
        const firstCharacter = name.charAt(0);
        const lastCharacter = name.charAt(name.length - 1);
        const middle = name.substr(1, name.length - 2);

        if (name.length <= 0) {
            return true;
        }
        if (!this.hasOption(OPTION_LEADING_UNDERSCORE) && firstCharacter === "_") {
            return false;
        }
        if (!this.hasOption(OPTION_TRAILING_UNDERSCORE) && lastCharacter === "_") {
            return false;
        }
        return firstCharacter === firstCharacter.toLowerCase() && middle.indexOf("_") === -1;
    }

    private isUpperCase(name: string) {
        return name === name.toUpperCase();
    }
}
