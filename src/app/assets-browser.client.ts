import { BehaviorSubject, Observable, of } from "rxjs";
import { map, mergeMap, tap } from 'rxjs/operators';
import { Asset, Nodes, progressMessage, UploadStep } from './data';

import * as FluxLibCore from '@youwol/flux-core'
import { uuidv4 } from '@youwol/flux-core';

export class Drive {

    driveId: string
    name: string

    constructor({ driveId, name }: { driveId: string, name: string }) {
        this.driveId = driveId
        this.name = name
    }
}
export class Folder {

    folderId: string
    name: string
    parentFolderId: string

    constructor({ folderId, parentFolderId, name }: { parentFolderId: string, folderId: string, name: string }) {
        this.folderId = folderId
        this.name = name
        this.parentFolderId = parentFolderId
    }
}
export class Item {

    treeId: string
    name: string
    kind: string
    assetId: string
    rawId: string
    borrowed: boolean
    constructor({ treeId, name, kind, assetId, rawId, borrowed }:
        {
            treeId: string, name: string, kind: string,
            assetId: string, rawId: string, borrowed: boolean
        }) {

        this.treeId = treeId
        this.name = name
        this.kind = kind
        this.assetId = assetId
        this.rawId = rawId
        this.borrowed = borrowed
    }
}


export class AssetsBrowserClient {

    static urlBase = '/api/assets-gateway'
    static urlBaseOrganisation = '/api/assets-gateway/tree'
    static urlBaseAssets = '/api/assets-gateway/assets'
    static urlBaseRaws = '/api/assets-gateway/raw'

    static allGroups = undefined

    static headers: { [key: string]: string } = {}

    static setHeaders(headers: { [key: string]: string }) {
        AssetsBrowserClient.headers = headers
    }

    static newDrive$(node: Nodes.GroupNode) {

        let url = `${AssetsBrowserClient.urlBaseOrganisation}/groups/${node.id}/drives`
        let body = { "name": "new drive" }

        let request = new Request(url, { method: 'PUT', body: JSON.stringify(body), headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static deleteItem$(node: Nodes.FluxProjectNode) {

        let url = `${AssetsBrowserClient.urlBaseOrganisation}/items/${node.id}`
        let uid = uuidv4()
        node.addStatus({ type: 'request-pending', id: uid })
        let request = new Request(url, { method: 'DELETE', headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static deleteFolder$(node: Nodes.FolderNode) {

        let url = `${AssetsBrowserClient.urlBaseOrganisation}/folders/${node.id}`

        let uid = uuidv4()
        node.addStatus({ type: 'request-pending', id: uid })
        let request = new Request(url, { method: 'DELETE', headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static deleteDrive$(node: Nodes.DriveNode) {

        let url = `${AssetsBrowserClient.urlBaseOrganisation}/drives/${node.id}`

        let uid = uuidv4()
        node.addStatus({ type: 'request-pending', id: uid })
        let request = new Request(url, { method: 'DELETE', headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static newFluxProject$(node: Nodes.FolderNode) {

        let url = `${AssetsBrowserClient.urlBaseAssets}/flux-project/location/${node.id}`
        let request = new Request(url, { method: 'PUT', headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static newStory$(node: Nodes.FolderNode) {

        let url = `${AssetsBrowserClient.urlBaseAssets}/story/location/${node.id}`
        let request = new Request(url, { method: 'PUT', headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static purgeDrive$(node: Nodes.TrashNode) {

        let url = AssetsBrowserClient.urlBaseOrganisation + `/drives/${node.driveId}/purge`
        let request = new Request(url, { method: 'DELETE', headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static newFolder$(node: Nodes.DriveNode | Nodes.FolderNode) {

        let url = `${AssetsBrowserClient.urlBaseOrganisation}/folders/${node.id}`
        let body = {
            "name": "new folder"
        }
        let request = new Request(url, {
            method: 'PUT', body: JSON.stringify(body),
            headers: AssetsBrowserClient.headers
        })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static renameFolder$(node: Nodes.FolderNode, newName: string) {

        let url = `${AssetsBrowserClient.urlBaseOrganisation}/folders/${node.id}`
        let body = { "name": newName }
        let request = new Request(url, { method: 'POST', body: JSON.stringify(body), headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static renameDrive$(node: Nodes.DriveNode, newName: string) {

        let url = `${AssetsBrowserClient.urlBaseOrganisation}/drives/${node.driveId}`
        let body = { "name": newName }
        let request = new Request(url, { method: 'POST', body: JSON.stringify(body), headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }


    static renameAsset$(node: Nodes.ItemNode, newName: string) {

        let url = `${AssetsBrowserClient.urlBaseAssets}/${node.id}`
        let body = { "name": newName }
        let request = new Request(url, { method: 'POST', body: JSON.stringify(body), headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static move$(target: Nodes.ItemNode | Nodes.FolderNode, folder: Nodes.FolderNode | Nodes.DriveNode) {

        let url = `${AssetsBrowserClient.urlBaseOrganisation}/${target.id}/move`
        let body = { destinationFolderId: folder.id }

        let request = new Request(url, { method: 'POST', body: JSON.stringify(body), headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static borrow$(target: Nodes.ItemNode | Nodes.FolderNode, folder: Nodes.FolderNode | Nodes.DriveNode) {

        let url = `${AssetsBrowserClient.urlBaseOrganisation}/${target.id}/borrow`
        let body = { destinationFolderId: folder.id }

        let request = new Request(url, { method: 'POST', body: JSON.stringify(body), headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }


    static queryAssets$(query): Observable<Array<Asset>> {

        let url = AssetsBrowserClient.urlBaseAssets + "/query-tree"
        let request = new Request(url, { method: 'POST', body: JSON.stringify(query), headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request).pipe(
            map(({ assets }) => assets.map(asset => new Asset(asset)))
        )
    }

    static getAsset$(assetId: string): Observable<Asset> {
        let url = AssetsBrowserClient.urlBaseAssets + `/${assetId}`
        let request = new Request(url, { headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request).pipe(
            map((asset: any) => new Asset(asset))
        )
    }

    static updateAsset$(asset: Asset, attributesUpdate): Observable<Asset> {

        let body = Object.assign({}, asset, attributesUpdate)
        let url = AssetsBrowserClient.urlBaseAssets + `/${asset.assetId}`
        let request = new Request(url, { method: 'POST', body: JSON.stringify(body), headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request).pipe(
            map((asset: any) => new Asset(asset))
        )
    }

    static addPicture$(asset: Asset, picture) {

        var formData = new FormData();
        formData.append('file', picture.file, picture.id)
        let url = AssetsBrowserClient.urlBaseAssets + `/${asset.assetId}/images/${picture.id}`
        let request = new Request(url, { method: 'POST', body: formData, headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request).pipe(
            map((asset: any) => new Asset(asset))
        )
    }

    static removePicture$(asset: Asset, pictureId) {

        let url = AssetsBrowserClient.urlBaseAssets + `/${asset.assetId}/images/${pictureId}`
        let request = new Request(url, { method: 'DELETE', headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request).pipe(
            map((asset: any) => new Asset(asset))
        )
    }

    static exposeGroup$(node: Nodes.FolderNode, { groupId, name }) {

        let url = AssetsBrowserClient.urlBase + `/exposed-groups/groups`
        let body = { groupId: groupId, name: name, folderId: node.id }
        let request = new Request(url, { method: 'POST', body: JSON.stringify(body), headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static package$(node: Nodes.DriveNode) {
        let url = `/api/assets-gateway/tree/drives/${node.driveId}/package`
        let request = new Request(url, { method: 'PUT', headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }


    static unpackage$(node: Nodes.ItemNode) {
        let url = `/api/assets-gateway/tree/items/${node.id}/unpack`
        let request = new Request(url, { method: 'PUT', headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static statistics$(assetId, binsCount) {

        let url = `/api/assets-gateway/assets/${assetId}/statistics?bins_count=${binsCount}`
        let request = new Request(url, { headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static permissions$(treeId: string) {

        let url = `/api/assets-gateway/tree/${treeId}/permissions`
        let request = new Request(url, { headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static accessInfo$(assetId: string) {

        let url = `/api/assets-gateway/assets/${assetId}/access`
        let request = new Request(url, { headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static updateAccess$(assetId: string, groupId: string, body) {

        let url = `/api/assets-gateway/assets/${assetId}/access/${groupId}`
        let request = new Request(url, { method: 'PUT', body: JSON.stringify(body), headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static getDeletedChildren$(groupId: string, driveId: string) {

        let url = `/api/assets-gateway/tree/drives/${driveId}/deleted`
        let request = new Request(url, { headers: AssetsBrowserClient.headers })

        return FluxLibCore.createObservableFromFetch(request).pipe(
            map(({ items, folders }: { items: Array<any>, folders: Array<any> }) => {

                return [
                    ...folders.map((folder: any) => new Nodes.DeletedFolderNode({ id: folder.folderId, name: folder.name, driveId })),
                    ...items.map((item: any) => new Nodes.DeletedItemNode({ id: item.itemId, name: item.name, driveId, type: item.type }))
                ]
            })
        ) as Observable<Array<Nodes.BrowserNode>>

    }

    static getFolderChildren$(groupId: string, driveId: string, folderId: string) {

        let url = `/api/assets-gateway/tree/folders/${folderId}/children`
        let request = new Request(url, { headers: AssetsBrowserClient.headers })

        return FluxLibCore.createObservableFromFetch(request).pipe(
            map(({ items, folders }: { items: Array<any>, folders: Array<any> }) => {
                return AssetsBrowserClient.children(groupId, driveId, folderId, { items, folders })
            })
        ) as Observable<Array<Nodes.BrowserNode>>
    }

    static getDrivesChildren$(groupId: string) {

        let url = `/api/assets-gateway/tree/groups/${groupId}/drives`
        let request = new Request(url, { headers: AssetsBrowserClient.headers })

        return FluxLibCore.createObservableFromFetch(request).pipe(
            map(({ drives }) => {

                return drives.map((drive: Drive) => {
                    return new Nodes.DriveNode({
                        id: drive.driveId, groupId: groupId, name: drive.name, driveId: drive.driveId,
                        children: AssetsBrowserClient.getFolderChildren$(groupId, drive.driveId, drive.driveId)
                    })
                })
            })
        ) as Observable<Array<Nodes.BrowserNode>>
    }

    static getGroupsChildren$(pathParent = "") {

        let url = '/api/assets-gateway/groups'
        let request = new Request(url, { headers: AssetsBrowserClient.headers })
        let start$ = this.allGroups
            ? of(this.allGroups)
            : FluxLibCore.createObservableFromFetch(request).pipe(
                tap(({ groups }) => this.allGroups = groups),
                map(({ groups }) => groups)
            )
        return start$.pipe(
            map((groups: Array<{ id: string, path: string }>) => {

                let children = groups.filter(grp => {
                    if (pathParent == "")
                        return grp.path == "private" || grp.path == "/youwol-users"
                    return grp.path != pathParent && grp.path.includes(pathParent) && (grp.path.slice(pathParent.length).match(/\//g)).length == 1
                })
                    .map(({ id, path }) => {

                        return new Nodes.GroupNode({
                            id: id, name: path == "private" ? "private" : path.slice(pathParent.length + 1),
                            children: AssetsBrowserClient.getDrivesChildren$(id).pipe(
                                mergeMap((drives) => {
                                    let children$ = AssetsBrowserClient.getGroupsChildren$(path).pipe(
                                        map((grps: [Array<Nodes.BrowserNode>]) => [...grps, ...drives]))
                                    return children$ as Observable<Array<Nodes.BrowserNode>>
                                })
                            )
                        })
                    })
                return children
            })
        ) as Observable<Array<Nodes.BrowserNode>>
    }

    static upload$(url, file) {

        let progress$ = new BehaviorSubject(new progressMessage(file.name, UploadStep.START))
        var formData = new FormData();
        formData.append("file", file);
        var request = new XMLHttpRequest();

        request.upload.onprogress = (event) => {
            console.log('on-progress', file.name, 100 * event.loaded / event.total)
            let message = event.loaded == event.total
                ? new progressMessage(file.name, UploadStep.PROCESSING, Math.floor(100 * event.loaded / event.total))
                : new progressMessage(file.name, UploadStep.SENDING, Math.floor(100 * event.loaded / event.total))
            progress$.next(message)
        };

        request.open("PUT", url, true);
        Object.entries(AssetsBrowserClient.headers).forEach(([k, v]) => request.setRequestHeader(k, v))
        request.onload = (e) => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    let resp = JSON.parse(request.responseText);
                    setTimeout(() => progress$.next(new progressMessage(file.name, UploadStep.FINISHED, 100, resp)), 500)
                } else {
                    console.error(request.statusText);
                }
            }
        };
        request.send(formData);
        return progress$
    }

    static uploadFile$(node: Nodes.FolderNode, file: File) {

        let url = `/api/assets-gateway/assets/data/location/${node.id}?group-id=${node.groupId}`
        return AssetsBrowserClient.upload$(url, file)
    }


    static uploadPackage$(node: Nodes.FolderNode, file: File) {

        let url = `/api/assets-gateway/assets/package/location/${node.id}?group-id=${node.groupId}`
        return AssetsBrowserClient.upload$(url, file)
    }

    static dataPreview$(rawId: string): Observable<{ kind: string, content: string }> {
        let url = `/api/assets-gateway/raw/data/metadata/${rawId}/preview`
        let request = new Request(url, { headers: AssetsBrowserClient.headers })

        return FluxLibCore.createObservableFromFetch(request)
    }

    static getDataMetadata$(rawId: string) {
        let url = `/api/assets-gateway/raw/data/metadata/${rawId}`
        let request = new Request(url, { headers: AssetsBrowserClient.headers })

        return FluxLibCore.createObservableFromFetch(request)
    }

    static updateDataMetadata$(rawId, body) {

        let url = `/api/assets-gateway/raw/data/${rawId}/metadata`
        let request = new Request(url, { method: 'POST', body: JSON.stringify(body), headers: AssetsBrowserClient.headers })

        return FluxLibCore.createObservableFromFetch(request)
    }

    static fluxProjectAssets$() {
        let body = { whereClauses: [{ column: "kind", relation: 'eq', term: 'flux-project' }], maxResults: 100 }
        let requestFluxProject = new Request(`/api/assets-gateway/assets/query-flat`,
            { method: 'POST', body: JSON.stringify(body), headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(requestFluxProject)
    }

    static modulesBoxAssets$() {

        let body = { whereClauses: [{ column: "kind", relation: 'eq', term: 'package' }], maxResults: 100 }
        let requestFluxProject = new Request(`/api/assets-gateway/assets/query-flat`,
            { method: 'POST', body: JSON.stringify(body), headers: AssetsBrowserClient.headers })

        return FluxLibCore.createObservableFromFetch(requestFluxProject)
    }

    static importFluxProjects$(node: Nodes.FolderNode, assets: Array<Asset>) {

        let body = {
            groupId: node.groupId,
            folderId: node.id,
            assetIds: assets.map(asset => asset.assetId)
        }
        let request = new Request(`/api/assets-gateway/flux-projects/import`,
            { method: 'POST', body: JSON.stringify(body), headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static getFluxProject$(rawId) {
        let request = new Request(`/api/assets-gateway/raw/flux-project/${rawId}`, { headers: AssetsBrowserClient.headers })

        return FluxLibCore.createObservableFromFetch(request)
    }

    static updateFluxProjectMetadata$(rawId: string, body) {

        let request = new Request(`/api/assets-gateway/raw/flux-project/${rawId}/metadata`,
            { method: 'POST', body: JSON.stringify(body), headers: AssetsBrowserClient.headers })

        return FluxLibCore.createObservableFromFetch(request)
    }

    static getPackageMetadata$(rawId: string) {

        let request = new Request(`/api/assets-gateway/raw/package/metadata/${rawId}`, { headers: AssetsBrowserClient.headers })

        return FluxLibCore.createObservableFromFetch(request)
    }

    static importFluxPacks$(node: Nodes.FolderNode, assets: Array<Asset>) {

        let body = {
            groupId: node.groupId,
            folderId: node.id,
            assetIds: assets.map(asset => asset.assetId)
        }
        let request = new Request(`/api/assets-gateway/flux-packs/import`,
            { method: 'POST', body: JSON.stringify(body), headers: AssetsBrowserClient.headers })
        return FluxLibCore.createObservableFromFetch(request)
    }

    static children(groupId, driveId, folderId, { items, folders }: { items: Array<any>, folders: Array<any> }) {

        return [
            ...folders.map((folder: Folder) => {
                return new Nodes.FolderNode({
                    id: folder.folderId, groupId, name: folder.name, driveId, parentFolderId: folderId,
                    children: AssetsBrowserClient.getFolderChildren$(groupId, driveId, folder.folderId)
                })
            }), ...items.map((item: Item) => {
                let assetData = {
                    id: item.treeId,
                    name: item.name,
                    groupId,
                    driveId,
                    folderId: folderId,
                    assetId: item.assetId,
                    relatedId: item.rawId,
                    borrowed: item.borrowed
                }
                if (item.kind == "flux-project")
                    return new Nodes.FluxProjectNode(assetData)
                if (item.kind == "story")
                    return new Nodes.StoryNode(assetData)
                if (item.kind == "group-showcase")
                    return new Nodes.ExposedGroupNode(assetData)
                if (item.kind == "data")
                    return new Nodes.DataNode(assetData)
                if (item.kind == "drive-pack")
                    return new Nodes.DataNode(assetData)
                if (item.kind == "package")
                    return new Nodes.FluxPackNode(assetData)
                throw Error("Unknown asset type")

            }), ...folderId == driveId
                ? [new Nodes.TrashNode({
                    id: 'trash_' + driveId, groupId: groupId, name: 'trash', driveId,
                    children: AssetsBrowserClient.getDeletedChildren$(groupId, driveId)
                })]
                : []
        ]
    }

    /*
        static deleteFluxProject(assetId, relatedId) {
    
            var requestAsset = new Request(`/api/assets-backend/flux-project/${assetId}`, { method: 'DELETE', headers: {} });
    
            var requestFlux = new Request(`/api/flux-backend/projects/${relatedId}`, { method: 'DELETE', headers: {} });
            fetch(requestFlux)
                .then(response => response.json())
                .then(_ => { console.log(`flux project ${assetId} deleted from flux-backend`) })
    
            return from(fetch(requestAsset).then(response => response.json()))
        }
    
        static deleteFluxComponent(assetId, relatedId) {
    
            var requestAsset = new Request(`/api/assets-backend/flux-component/${assetId}`, { method: 'DELETE', headers: {} });
            fetch(requestAsset)
                .then(response => response.json())
                .then(_ => { console.log(`flux component ${assetId} deleted from assets-backend`) })
    
            var requestFlux = new Request(`/api/flux-backend/components/${relatedId}`, { method: 'DELETE', headers: {} });
            fetch(requestFlux)
                .then(response => response.json())
                .then(_ => { console.log(`flux component ${assetId} deleted from flux-backend`) })
        }
    
        static duplicateFluxProject(originalAsset) {
    
            var requestFlux = new Request(`/api/flux-backend/projects/${originalAsset.relatedId}/duplicate`, { method: 'POST', body: "", headers: {} });
            return from(fetch(requestFlux).then(response => response.json())).pipe(
                mergeMap((project) => {
                    let body = {
                        relatedId: project.projectId
                    }
                    let request = new Request(`/api/assets-backend/flux-project`, { method: 'PUT', body: JSON.stringify(body) });
                    return from(fetch(request).then(r => r.json()))
                }),
                mergeMap((asset) => {
                    let body = {
                        name: originalAsset.name,
                        description: originalAsset.description,
                        tags: originalAsset.tags,
                        scope: originalAsset.scope
                    }
                    let request = new Request(`/api/assets-backend/flux-project/${asset.assetId}`, { method: 'POST', body: JSON.stringify(body) });
                    return from(fetch(request).then(r => asset))
                }),
                mergeMap((asset: any) => {
                    let request = new Request(`/api/assets-backend/flux-project/${asset.assetId}`);
                    return from(fetch(request).then(r => r.json()))
                })
            )
        }*/
}
