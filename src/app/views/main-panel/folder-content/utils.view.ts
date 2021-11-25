import { attr$, child$, Stream$, VirtualDOM } from "@youwol/flux-view";
import {
    getSettings$, popupAssetModalView, ywSpinnerView, AssetActionsView,
    PackageInfoView, AssetPermissionsView, FluxDependenciesView
} from "@youwol/flux-youwol-essentials";

import { Observable, of } from "rxjs";
import { distinct, filter, map, mergeMap, take } from "rxjs/operators";
import { AppState } from "../../../app.state";
import { AssetsBrowserClient } from "../../../assets-browser.client";
import { AnyFolderNode, AnyItemNode, BrowserNode, DriveNode, FolderNode, ItemNode } from "../../../nodes";


export class RenamableItemView {

    baseClasses = 'd-flex align-items-center p-1 rounded m-3 fv-hover-bg-background-alt fv-pointer'
    class: Stream$<BrowserNode, string>
    children: VirtualDOM[]
    public readonly style: Stream$<{ type: string, id: string }[], { [key: string]: string }>
    public readonly onclick: any
    public readonly ondblclick: any
    public readonly state: AppState
    public readonly item: BrowserNode
    public readonly hovered$: Observable<BrowserNode>

    constructor(params: {
        state: AppState,
        item: BrowserNode,
        hovered$?: Observable<BrowserNode>
    }) {
        Object.assign(this, params)
        this.hovered$ = this.hovered$ || this.state.selectedItem$
        let baseClass = 'd-flex align-items-center p-1 rounded m-2 fv-pointer'
        this.class = attr$(
            this.state.selectedItem$,
            (node) => {
                return node && node.id == this.item.id ?
                    `${baseClass} fv-text-focus` :
                    `${baseClass}`
            },
            { untilFirst: baseClass }
        )

        this.style = attr$(
            this.item.status$,
            (statuses: { type, id }[]) => statuses.find(s => s.type == 'cut') != undefined
                ? { opacity: 0.3 }
                : {},
            {
                wrapper: (d) => ({ ...d, userSelect: 'none' })
            }
        )

        this.children = [
            this.item instanceof ItemNode && this.item.borrowed
                ? { class: 'fas fa-link pr-1' }
                : undefined,
            {
                class: `fas ${this.item.icon} mr-1`
            },
            child$(
                this.item.status$,
                statusList => statusList.find(s => s.type == 'renaming')
                    ? this.editView()
                    : { innerText: this.item.name }
            ),
            child$(
                this.item.status$,
                (status) => {
                    return status.find(s => s.type == 'request-pending')
                        ? ywSpinnerView({ classes: 'mx-auto my-auto', size: '15px', duration: 1.5 })
                        : {}
                }
            ),
            child$(
                this.hovered$,
                (node) => this.infosView(node)
            )
        ]
        this.onclick = () => this.state.selectItem(this.item)
        this.ondblclick = () => {
            getSettings$().pipe(
                take(1)
            ).subscribe((settings) => {

                let app = settings.defaultApplications
                    .find((preview) => preview.canOpen(this.item))
                if (!app || !(this.item instanceof ItemNode))
                    return

                let asset = { name: this.item.name, assetId: this.item.assetId, rawId: this.item.rawId }
                let instance = this.state.createInstance({
                    icon: 'fas fa-play',
                    title: app.name + "#" + this.item.name,
                    appURL: app.applicationURL(asset)
                })
                this.state.focus(instance)
            })
        }
    }

    infosView(node: BrowserNode) {
        if (!(node instanceof ItemNode))
            return {}

        let asset$ = of(node).pipe(
            mergeMap(({ assetId }) => {
                return AssetsBrowserClient.getAsset$(assetId)
            })
        )
        let infoView = {
            tag: 'button',
            class: 'fas fv-btn-secondary fa-info-circle fv-text-primary fv-pointer mx-4 rounded p-1',
            onclick: () => {
                let withTabs = {
                    Permissions: new AssetPermissionsView({ asset: node as any })
                }
                if (node.kind == "flux-project") {
                    withTabs['Dependencies'] = new FluxDependenciesView({ asset: node as any })
                }
                if (node.kind == "package") {
                    withTabs['Package Info'] = new PackageInfoView({ asset: node as any })
                }
                let assetUpdate$ = popupAssetModalView({
                    asset$,
                    actionsFactory: (asset) => {
                        return new AssetActionsView({ asset })
                    },
                    withTabs
                })

                assetUpdate$.pipe(
                    map(asset => asset.name),
                    distinct()
                ).subscribe((name) => {
                    this.state.rename(node, name, false)
                })
            }
        }
        return node.id == this.item.id ? infoView : {}
    }


    editView() {

        return {
            tag: 'input',
            type: 'text',
            autofocus: true,
            style: { "z-index": 200 },
            class: "mx-2",
            data: this.item.name,
            onclick: (ev) => ev.stopPropagation(),
            onkeydown: (ev) => {
                if (ev.key === 'Enter')
                    this.state.rename(this.item as any, ev.target.value)
            }
        }

    }
}
