import { attr$, HTMLElement$, VirtualDOM } from "@youwol/flux-view";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { AppState } from "../../app.state"


export class RunningApp {

    public readonly state: AppState
    public readonly instanceId: string
    public readonly title: string
    public readonly icon: string
    public readonly appURL$: Observable<string>
    public readonly topBannerActions$ = new ReplaySubject<VirtualDOM>(1)
    public readonly iframe$ = new ReplaySubject<HTMLIFrameElement>()

    public readonly view: VirtualDOM

    htmlElement: HTMLElement
    constructor(params: {
        state: AppState,
        instanceId: string,
        title: string,
        icon: string,
        appURL$: Observable<string>
    }) {
        Object.assign(this, params)
        this.view = {
            style: {
                border: 'thick double'
            },
            class: attr$(
                this.state.runningApplication$,
                (app) => app && app.instanceId == this.instanceId
                    ? 'h-100 w-100 d-flex'
                    : 'd-none'
            ),
            children: [
                {
                    tag: 'iframe',
                    width: '100%',
                    height: '100%',
                    src: attr$(
                        this.appURL$,
                        (url) => url
                    ),
                    connectedCallback: (elem: HTMLElement$ & HTMLIFrameElement) => {
                        console.log("Iframe application created")
                        this.iframe$.next(elem)
                    }
                }
            ],
            connectedCallback: (elem: HTMLElement) => {
                this.htmlElement = elem
            }
        }
    }

    terminateInstance() {
        this.htmlElement.remove()
    }
}
