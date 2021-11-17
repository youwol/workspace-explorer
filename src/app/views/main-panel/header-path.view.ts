import { attr$, child$, children$, Stream$, VirtualDOM } from "@youwol/flux-view"
import { ywSpinnerView } from "@youwol/flux-youwol-essentials"
import { BehaviorSubject, combineLatest, merge, Subject } from "rxjs"
import { filter } from "rxjs/operators"
import { AppState } from "../../app.state"
import { Nodes } from "../../data"
import { DisplayMode } from "./main-panel.view"


class DisplayModesView implements VirtualDOM {

    public readonly class = 'd-flex py-1 border-bottom justify-content-around'
    public readonly children: VirtualDOM[]

    public readonly displayMode$: Subject<DisplayMode>

    constructor(params: { displayMode$: Subject<DisplayMode> }) {

        Object.assign(this, params)

        this.children = [
            this.itemView('cards'),
            this.itemView('miniatures'),
            this.itemView('details')
        ]
    }

    itemView(mode: DisplayMode) {
        let icons: Record<DisplayMode, string> = {
            'cards': "fa-th-large",
            'miniatures': "fa-th",
            'details': "fa-th-list",
        }
        let baseClass = `fv-pointer fv-hover-text-secondary fas ${icons[mode]} mx-2 p-1`
        let selectionClass = "fv-text-focus"
        return {
            class: attr$(
                this.displayMode$,
                (m) => m == mode ? `${baseClass} ${selectionClass}` : `${baseClass}`
            ),
            onclick: () => this.displayMode$.next(mode)
        }
    }
}

export class HeaderPathView implements VirtualDOM {

    public readonly class = "w-100 d-flex p-2 fv-bg-background-alt"

    public readonly children: VirtualDOM[]// Stream$<Nodes.FolderNode, VirtualDOM[]>

    public readonly state: AppState
    public readonly displayMode$: Subject<DisplayMode>

    constructor(params: { state: AppState, displayMode$: Subject<DisplayMode> }) {

        Object.assign(this, params)

        this.children = [
            {
                class: 'd-flex flex-grow-1',
                children: children$(
                    this.state.currentFolder$,
                    (folder: Nodes.FolderNode) => {
                        let path = this.state.homeTreeState.reducePath(folder.id, (node) => {
                            return node
                        })
                        let isLoading$ = merge(...path.map(n => n.status$))
                        let items = path.map((node) => [this.pathElemView(node, folder), { class: "px-2 my-auto", innerText: '/' }])
                        return items.flat().slice(0, -1).concat([this.loadingSpinner(isLoading$)])
                    }
                )
            },
            new DisplayModesView({ displayMode$: this.displayMode$ })
        ]
    }

    loadingSpinner(isLoading$/*selectedNode: Nodes.FolderNode*/) {

        return {
            class: 'h-100 d-flex flex-column justify-content-center px-2',
            children: [
                child$(isLoading$,
                    (status) => {
                        return status.find(s => s.type == 'request-pending')
                            ? ywSpinnerView({ classes: 'mx-auto', size: '20px', duration: 1.5 })
                            : {}
                    }
                )
            ]
        }
    }

    pathElemView(node: Nodes.FolderNode, selectedNode: Nodes.FolderNode): VirtualDOM {
        console.log("Update path header view")
        let baseClass = 'p-1 rounded d-flex align-items-center fv-pointer fv-bg-background'
        return {
            class: node.id == selectedNode.id
                ? `${baseClass} fv-border-focus fv-text-focus fv-hover-text-primary fv-hover-bg-secondary`
                : `${baseClass} fv-border-primary fv-hover-text-primary fv-hover-bg-secondary`,
            children: [
                {
                    class: node.icon
                },
                {
                    class: "px-2",
                    innerText: node.name
                }
            ],
            onclick: () => this.state.openFolder(node)
        }
    }
}
