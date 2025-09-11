export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'stock-manager' | 'employee';
  department?: string;
  isactive: boolean;
  createdat: Date;
  lastlogin?: Date;
  profilepicture?: string;
  phone?: string;
  address?: string;
  bio?: string;
}


export interface InventoryItem {
  id: string;
  uniqueid: string;
  financialyear: string;
  assetcategory: string;
  dateofinvoice: Date | null;
  dateofentry: Date | null;
  invoicenumber: string;
  assetcategoryid: string;
  assetname: string;
  specification: string;
  makemodel: string;
  productserialnumber: string;
  vendorname: string;
  quantityperitem: number;
  rateinclusivetax: number;
  totalcost: number;
  locationofitem: string;
  issuedto?: string;
  dateofissue?: Date | null;
  expectedreturndate?: Date | null;
  balancequantityinstock: number;
  description: string;
  unitofmeasurement: string;
  depreciationmethod?: string;
  warrantyinformation?: string;
  maintenanceschedule?: string;
  conditionofasset: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  status: 'available' | 'issued' | 'maintenance' | 'retired';
  minimumstocklevel: number;
  purchaseordernumber?: string;
  expectedlifespan?: string;
  assettag?: string;
  salvagevalue?: number;
  attachments?: { name: string; url: string }[] | File[]; // Can be URLs from DB or Files during upload
  lastmodifiedby: string;
  lastmodifieddate: Date;
  createdat: Date;
}

export interface Attachment {
  name: string;
  url: string;
}


export interface Request {
  id: string;
  employeeid: string;
  employeename: string;
  itemtype: string;
  quantity: number;
  purpose: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedat: Date;
  reviewedat?: Date;
  reviewedby?: string;
  reviewername?: string;
  remarks?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'major' | 'minor';
  description?: string;
  isactive: boolean;
  createdat: Date;
  updatedat: Date;
  createdby: string;
}

// export interface Notification {
//   id: string;
//   userId: string;
//   type: 'request' | 'approval' | 'rejection' | 'low-stock' | 'system';
//   title: string;
//   message: string;
//   isread: boolean;
//   createdat: Date;
// }


export interface Notification {
  employeeid: string;
  employeename: string;
  itemtype: string;
  justification: string;
  purpose: string;
  quantity: number;
  remarks?: string | null;
  reviewedat?: string | null;
  reviewedby?: string | null;
  reviewername?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  submittedat: string;
}
