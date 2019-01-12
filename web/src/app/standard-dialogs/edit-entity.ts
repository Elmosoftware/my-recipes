import { Helper } from "../shared/helper";
import { Entity } from "../model/entity";

export class EditEntity {

    private dialogRef: any;
    public model: Entity | any;
    public helper: Helper;
    public isPublished: boolean; //We add a boolean property to handle easily the publishing.
    public readonly autoPublish: boolean;

    constructor(entity: Entity | any, autoPublish: boolean = false, dialogRef: any = null) {
        this.helper = new Helper();
        this.model = entity;
        this.autoPublish = autoPublish;
        this.dialogRef = dialogRef;

        if (this.autoPublish && !entity.publishedOn) {
            this.model.publishedOn = new Date();
        }

        this.isPublished = (this.model.publishedOn) ? true : false;

        /* 
        Why this?:
        Because when the ng-select dropdown expands inside the dialog, force the dialog to show a vertical scrollbar. 
        This difficults to visualize the dropdown list and select the appropiate items with ease.
      
        The issue is described here: https://github.com/ng-select/ng-select/issues/240
      
        But the proposed solution is to change manually the CSS file, i think the best is to override the value dinamically. 
        */
        this.dialogRef.afterOpen().subscribe(() => {

            let dlg = document.getElementsByTagName("mat-dialog-container");

            if (dlg && dlg.length > 0) {
                (dlg[0] as any).style.overflow = "visible";
            }
        })
    }

    public get isPublishedChanged(): boolean {
        return this.isPublished != ((this.model.publishedOn) ? true : false);
    }

    public get friendlyPublishDate(): string {
        let ret: string = "";

        if (this.isPublishedChanged) {
            if (this.isPublished) {
                ret = this.helper.friendlyCalendarTime(new Date());
            }
        }
        else if (this.model.publishedOn) {
            ret = this.helper.friendlyCalendarTime(this.model.publishedOn);
        }

        return ret;
    }

    closeDlg(): void {

        if (this.isPublishedChanged) {
            this.model.publishedOn = (this.isPublished) ? new Date() : null;
        }

        this.dialogRef.close(this.model);
    }
}