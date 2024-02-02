
import * as vscode from 'vscode';
import * as path from 'path';
import { CaseConversionType } from './CaseConversionType';
const changeCase = import("change-case");

export function activate(context: vscode.ExtensionContext) {
	let disposableKebabCase = vscode.commands.registerCommand('filename-operations.toKebabCase', async (contextSelection: vscode.Uri, allSelections: vscode.Uri[]) => {

		for (let index = 0; index < allSelections.length; index++) {
			const uri = allSelections[index];

			if (uri.scheme === 'file') {
				convertTo(CaseConversionType.Kebab, uri);
			} else {
				vscode.window.showErrorMessage('The provided URI is not a file URI.');
			}
		}
	});

	let disposableCamelCase = vscode.commands.registerCommand('filename-operations.toCamelCase', async (contextSelection: vscode.Uri, allSelections: vscode.Uri[]) => {

		for (let index = 0; index < allSelections.length; index++) {
			const uri = allSelections[index];

			if (uri.scheme === 'file') {
				convertTo(CaseConversionType.Camel, uri);
			} else {
				vscode.window.showErrorMessage('The provided URI is not a file URI.');
			}
		}
	});

	context.subscriptions.push(disposableKebabCase);
	context.subscriptions.push(disposableCamelCase);
}

async function convertTo(caseConversionType: CaseConversionType, uri: vscode.Uri) {
	const fileName = uri.fsPath;
	const fileNameWithoutPath = path.basename(fileName); // Get just the filename
	const fileExtension = path.extname(fileNameWithoutPath).slice(1); // Get the file extension without the dot
	const fileNameWithoutExtension = path.basename(fileNameWithoutPath, `.${fileExtension}`); // Get the filename without the extension

	var convertedFilename = "";

	switch (caseConversionType) {
		case CaseConversionType.Kebab:
			convertedFilename = (await changeCase).kebabCase(fileNameWithoutExtension);
			break;

		case CaseConversionType.Camel:
			convertedFilename = (await changeCase).camelCase(fileNameWithoutExtension);
			break;
		case CaseConversionType.Capital:
			convertedFilename = (await changeCase).capitalCase(fileNameWithoutExtension);
			break;

		case CaseConversionType.Constant:
			convertedFilename = (await changeCase).constantCase(fileNameWithoutExtension);
			break;
		case CaseConversionType.Dot:
			convertedFilename = (await changeCase).dotCase(fileNameWithoutExtension);
			break;
		default:
			vscode.window.showErrorMessage(`Could not convert ${fileNameWithoutPath}`);
			return;
	}

	if (fileNameWithoutExtension !== convertedFilename) {
		// Construct the new filename with extension
		const newFileName = `${convertedFilename}.${fileExtension}`;

		// Rename the file
		const newUri = vscode.Uri.file(path.join(path.dirname(fileName), newFileName));
		vscode.workspace.fs.rename(uri, newUri).then(() => {
			vscode.window.showInformationMessage(`File name converted to ${CaseConversionType[caseConversionType]} case and renamed.`);
		}, (error) => {
			vscode.window.showErrorMessage(`Error renaming file: ${error.message}`);
		});
	} else {
		vscode.window.showInformationMessage(`File name is already in ${CaseConversionType[caseConversionType]} case.`);
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }
