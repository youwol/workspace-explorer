import { createObservableFromFetch, uuidv4 } from "@youwol/flux-core"
import { TreeGroup } from "../../app.state"
import { AssetsBrowserClient } from "../../assets-browser.client"
import { AnyFolderNode, FutureNode, ItemNode } from "../../nodes"

export class FluxState {

    constructor(public readonly userTree: TreeGroup) {

    }
    static newFluxProject$(node: AnyFolderNode) {

        let url = `${AssetsBrowserClient.urlBaseAssets}/flux-project/location/${node.id}`
        let request = new Request(url, { method: 'PUT', headers: AssetsBrowserClient.headers })
        return createObservableFromFetch(request)
    }

    new(parentNode: AnyFolderNode) {
        let uid = uuidv4()
        parentNode.addStatus({ type: 'request-pending', id: uid })
        let node = new FutureNode({
            name: "new project",
            icon: "fas fa-play",
            request: FluxState.newFluxProject$(parentNode),
            onResponse: (resp, node) => {
                let projectNode = new ItemNode({
                    id: resp.treeId,
                    kind: 'flux-project',
                    groupId: parentNode.groupId,
                    driveId: parentNode.driveId,
                    name: resp.name,
                    assetId: resp.assetId,
                    rawId: resp.relatedId,
                    borrowed: false,
                })
                this.userTree.replaceNode(node, projectNode)
            }
        })
        this.userTree.addChild(parentNode.id, node)
    }

}
