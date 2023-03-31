import * as vscode from 'vscode';
import * as path from 'path';

export class SurfaceViewerEditorProvider implements vscode.CustomTextEditorProvider {

	private static readonly viewType = 'surfacePalette.view';
	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new SurfaceViewerEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(SurfaceViewerEditorProvider.viewType, provider);
		return providerRegistration;
	}

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};

		const surfaces = JSON.parse(document.getText()) as SurfacesJson;
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, surfaces, document.uri);
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview, surfaces: SurfacesJson, documentUri: vscode.Uri): string {
		
		// show list?
		let surfacesHtml = "";

		if(surfaces.Version >= 2){
			for(let item of surfaces.Items){
				let uri = vscode.Uri.file(path.dirname(documentUri.fsPath));
				let surfaceUri = vscode.Uri.joinPath( uri, `surface${item.Id}.png`);
				let wvuri = webview.asWebviewUri(surfaceUri);
				let offsetX = -item.OffsetX + (item.BaseSizeWidth - item.SizeWidth);
				let offsetY = -item.OffsetY + (item.BaseSizeHeight - item.SizeHeight);
				
				surfacesHtml += `<div style="margin: 1px; display: inline-block; max-width: ${item.FrameX}px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">`;
				surfacesHtml += `<img width="${item.FrameX}px" height="${item.FrameY}px" src="${wvuri}" style="object-fit: none; object-position: ${offsetX}px ${offsetY}px;" >`;
				surfacesHtml += `<br>`;
				if(item.SurfaceTableLabel != null){
					surfacesHtml += `[${item.Id}] ${item.SurfaceTableLabel}`;
				}
				else{
					surfacesHtml += `[${item.Id}]`;
				}
				surfacesHtml += `</div>`;
			}
		}
		else{
			surfacesHtml = "サーフェスパレットが認識されていません。<br>最新のさとりすとでsurfaces.jsonを出力する必要があるかもしれません。";
		}

		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>SurfacePalette</title>
			</head>
			<body>
				${surfacesHtml}
			</body>
			</html>`;
	}
}

//シェルのメタデータ
class SurfacesJson
{
	public Items : Array<SurfacesJsonItem>;
	public Version = 0;

	public constructor()
	{
		this.Items = [];
	}
}

class SurfacesJsonItem
{
	public IsEnableSurfaceViewer = false;
	public IsEnableSurfacePalette = false;
	public Id = 0;
	public Scope = 0;
	public OffsetX = 0;
	public OffsetY = 0;
	public FrameX = 0;
	public FrameY = 0;
	public SurfaceTableLabel = "";
	public Expand = 1.0;
	public BaseSizeWidth = 0;
	public BaseSizeHeight = 0;
	public SizeWidth = 0;
	public SizeHeight = 0;
}