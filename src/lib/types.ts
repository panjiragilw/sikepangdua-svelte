import type { Component, Snippet } from 'svelte';
import type { SizeType, IndicatorProps, CardProps, HeadingProps, DropdownProps } from 'flowbite-svelte';
import type { ApexOptions } from 'apexcharts';
import type { HTMLFormAttributes, HTMLAttributes } from 'svelte/elements';

export type MenuItem = {
  name: string;
  href: string;
  icon: Component;
};

export interface AppsMenuProps {
  open?: boolean;
  menu: MenuItem[];
}

export interface ChangeProps {
  value?: number;
  unit?: string;
  since?: string;
  size?: SizeType;
  equalHeight?: boolean;
  class?: string;
}

export interface ChartWidgetProps {
  title: string;
  subtitle: string;
  chartOptions?: ApexOptions;
  value?: number;
  cardClass?: string;
  headingClass?: string;
}

export interface ChatMsgProps {
  children: Snippet;
  avatar?: string;
  name?: string;
  timestamp?: Date;
  replays?: number;
  class?: string;
}

export interface IconAvatarProps {
  children: Snippet;
  src: string;
  color?: IndicatorProps['color'];
}

export const DEFAULT_TIMESLOTS = {
  Yesterday: -1,
  Today: 0,
  'Last 7 days': 7,
  'Last 30 days': 30,
  'Last 90 days': 90
};

export type TimeSlot = keyof typeof DEFAULT_TIMESLOTS;

export interface MoreProps {
  title?: string;
  href?: string;
  flat?: boolean;
  class?: string;
}

export interface NotificationProps {
  children: Snippet;
  src: string;
  Icon?: Component;
  when?: string;
  href?: string;
  color: IndicatorProps['color'];
}

export type ProductType = {
  id?: string;
  name?: string;
  src?: string;
  image?: string;
  label?: string;
  change?: number;
  price?: string;
  attributes?: {
    [key: string]: any;
  };
  metadata?: Record<string, any>;
};

export type CustomerType = {
  id?: number;
  name?: string;
  avatar?: string;
  email?: string;
  biography?: string;
  position?: string;
  country?: string;
  status?: string;
};

export interface StatsProps {
  // products: ProductType[];
  // customers: CustomerType[];
  eligible: EmployeePromotionCheck[];
  notEligible: EmployeePromotionCheck[];
  title?: string;
  popoverTitle?: string;
  popoverDesc?: Snippet;
  tab1Title?: string;
  tab2Title?: string;
  // tab3Title?: string;
}

export const STATES = {
  completed: 'Completed',
  cancelled: 'Canceled',
  inreview: 'In review',
  inprogress: 'In progress'
};

export type StateType = keyof typeof STATES;

export interface StatusBadgeProps {
  state: StateType;
  dark?: boolean;
}

export interface UserMenuProps {
  name: string;
  avatar: string;
  email: string;
  menuItems?: string[];
  children?: Snippet;
  placement?: DropdownProps['placement'];
}

export interface SiteType {
  name: string;
  img: string;
  link: string;
  imgAlt: string;
}

export interface ForgotPasswordProps extends HTMLFormAttributes {
  children: Snippet;
  title?: string;
  site?: SiteType;
  btnTitle?: string;
  pageDescription?: string;
  mainClass?: string;
  mainDivClass?: string;
  siteLinkClass?: string;
  siteImgClass?: string;
  cardH1Class?: string;
}

export interface PriceCardPriceProps {
  children?: Snippet;
  subtitle?: Snippet;
  title?: string;
  price?: string;
  period: string;
}

export interface PriceCardPriceProps {
  value?: string;
  period: string;
}

export interface PriceCardListItemProps {
  icon?: boolean;
  children: Snippet;
}

export type FaqType = {
  title: string;
  answer: string;
};

export interface FaqProps {
  title: string;
  description?: string;
  faqs: FaqType[];
}

export interface ImgType {
  src: string;
  alt: string;
}

export interface NotFoundProps {
  title?: string;
  description?: string;
  image?: ImgType;
  btnTitle?: string;
  btnHref?: string;
  mainClass?: string;
  mainDivClass?: string;
  h1Class?: string;
  imgDiv?: string;
  div2Class?: string;
}

export interface MaintenanceProps {
  title?: string;
  description?: string;
  image?: ImgType;
  btnTitle?: string;
  btnHref?: string;
  mainClass?: string;
  mainDivClass?: string;
  h1Class?: string;
  imgDiv?: string;
  div2Class?: string;
}

export interface ServerErrorProps {
  title?: string;
  description?: string;
  image?: ImgType;
  btnTitle?: string;
  btnHref?: string;
  mainClass?: string;
  mainDivClass?: string;
  h1Class?: string;
  imgDiv?: string;
  div2Class?: string;
}

export interface EmptyCardProps {
  size?: CardProps['size'];
  class?: CardProps['class'];
}

export interface PlaygroundProps {
  breadcrumb?: Snippet;
  title?: string;
}

export interface DeleteModalProps {
  open?: boolean;
  title?: string;
  yes?: string;
  no?: string;
}

export interface UserModalProps {
  open: boolean;
  data: Record<string, string>;
}

export interface DeleteDrawerProps {
  open?: boolean;
  title?: string;
  confirm?: string;
  yes?: string;
  no?: string;
  headingTag?: HeadingProps['tag'];
  headingClass?: string;
}

export interface UserType {
  name: string;
  img: string;
  imgAlt: string;
}

export interface ProfileLockProps extends HTMLFormAttributes {
  children: Snippet;
  site?: SiteType;
  user?: UserType;
  btnTitle?: string;
  pageDescription?: string;
  mainClass?: string;
  mainDivClass?: string;
  siteLinkClass?: string;
  siteImgClass?: string;
  cardH1Class?: string;
  cardDiv3Class?: string;
  userImgClass?: string;
  acceptTerms?: boolean;
  termsLink?: string;
  termsLinkClass?: string;
}

export interface RestPasswordProps extends HTMLFormAttributes {
  children: Snippet;
  site?: SiteType;
  title?: string;
  acceptTerms?: boolean;
  btnTitle?: string;
  pageDescription?: string;
  mainClass?: string;
  mainDivClass?: string;
  siteLinkClass?: string;
  siteImgClass?: string;
  cardH1Class?: string;
  cardDiv3Class?: string;
  userImgClass?: string;
  termsLink?: string;
  termsLinkClass?: string;
}

export interface SingInProps extends HTMLFormAttributes {
  children: Snippet;
  site?: SiteType;
  rememberMe?: boolean;
  title?: string;
  lostPassword?: boolean;
  createAccount?: boolean;
  lostPasswordLink?: string;
  loginTitle?: string;
  registerLink?: string;
  createAccountTitle?: string;
  acceptTerms?: boolean;
  btnTitle?: string;
  pageDescription?: string;
  mainClass?: string;
  mainDivClass?: string;
  siteLinkClass?: string;
  siteImgClass?: string;
  cardH1Class?: string;
}

export interface SingUpProps extends HTMLFormAttributes {
  children: Snippet;
  site?: SiteType;
  title?: string;
  haveAccount?: boolean;
  acceptTerms?: boolean;
  btnTitle?: string;
  termsLink?: string;
  loginLink?: string;
  pageDescription?: string;
  mainClass?: string;
  mainDivClass?: string;
  siteLinkClass?: string;
  siteImgClass?: string;
  cardH1Class?: string;
  haveAccoutDivClass?: string;
}

export interface CreditCardProps {
  number: number;
}

export interface DateRangeSelectorProps {
  timeslot?: TimeSlot;
  timeslots?: Record<string, number>;
}

export interface ProductMetricCardProps {
  chart?: Snippet;
  cardProps?: CardProps;
  title: string;
  subTitle?: string;
  changeProps?: ChangeProps;
  headingTag?: HeadingProps['tag'];
}

export type BrandType = {
  name: string;
  href: string;
  src: string;
  alt: string;
};

export type FooterLinkType = {
  className: string;
  href: string;
  item: string;
};

export type Menu = {
  title: string;
  links: FooterLinkType[];
};

export interface FooterProps {
  brand: BrandType;
  description?: Snippet;
  menus: Menu[];
}

interface SelectOption {
  value: string;
  label: string;
}

interface AdditionalField {
  name: string; // Form field name (e.g., 'technology', 'category')
  label: string; // Display label (e.g., 'Technology', 'Category')
  placeholder?: string; // Default option text (e.g., 'Select technology')
  options: SelectOption[];
}

export interface ProductDrawerProps extends HTMLFormAttributes {
  open?: boolean;
  title?: string;
  data?: Record<string, unknown>;
  additionalFields?: AdditionalField[];
}

export interface ActivityListProps {
  title?: string;
  children: Snippet;
  actions?: Snippet;
}

export interface CategorySalesReportProps {
  title: string;
  titleTag?: HeadingProps['tag'];
  subtitle?: string;
  changeProps?: ChangeProps;
  chart?: Snippet;
  cardClasss?: string;
  divClass?: string;
  headingClass?: string;
  spanClass?: string;
}

export interface ComparisonTableProps {
  columns?: string[];
  rows?: { name: string; [key: string]: string | boolean }[];
}

export type TableRow = {
  [key: string]: string | boolean;
  name: string;
};

export interface CardWidgetProps {
  children: Snippet;
  title: string;
  subtitle?: string;
  class?: string;
}

export interface CardListProps {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  items: any[];
  class?: string;
}

export type NotificationItem = {
  title: string;
  subtitle: string;
  active: boolean;
};

export interface NotificationCardProps {
  title?: string;
  items: NotificationItem[];
  subtitle?: string;
  class?: string;
}

type InputType =
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'reset'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week'
  | 'search';

export interface InputField {
  label: string;
  type: InputType;
  placeholder: string;
}

export interface GeneralInfoProps {
  inputs: InputField[];
}

export type Language = {
  name: string;
  value: string;
};

export type Timezone = {
  name: string;
  value: string;
};

export interface LanguageTimeProps {
  children?: Snippet;
  timezones?: Timezone[];
  languages?: Language[];
}

export type MoreOption = {
  title: string;
  href: string;
};

export interface IconOption {
  icon: Component;
  iconClass?: string;
  size?: string;
}

export interface SmallPanelProps {
  IconOption?: IconOption;
  title?: string;
  subtitle?: string;
  change?: number;
}

export type DeviceOption = {
  title?: string;
  subtitle?: string;
  change?: number;
  IconOption: IconOption;
};

export interface TrafficProps {
  chart?: Snippet;
  title?: string;
  subtitle?: string;
  more?: MoreOption;
  devices?: DeviceOption[];
}

export type SessionType = {
  ipaddress: string;
  device: string;
  href: string;
  btnName?: string;
  IconOption?: IconOption;
};
export interface SessionProps {
  seeMorehref?: string;
  sessions: SessionType[];
}

export type NotificationData = Omit<NotificationProps, 'children'> & {
  content: string;
};

export interface NotificationListProps {
  notifications: NotificationData[];
}

export interface UserProfileProps {
  children?: Snippet;
  src: string;
  title?: string;
  subtitle?: string;
}

export type UserAccount = {
  avatar: string;
  name: string;
  country: string;
  status: string;
};
export interface AccountsProps {
  children?: Snippet;
  users: UserAccount[];
  title?: string;
  headingTag?: HeadingProps['tag'];
  headingClass?: string;
  listClass?: string;
  liClass?: string;
}

export type Sort = {
    sort_by: string;
    order_by: "asc" | "desc";
  };

export type Meta = {
  pagination: API_Pagination;
  sort: Sort;
};

export type ApiResponseSuccess = {
  status: number;
  data: RegularPromotionCheckResult;
  meta: Meta;
};

export type ApiResponseError = {
  status: number;
  error: string;
  logMsg: string;
};

export type API_Pagination = {
  page: number;
  pages: number;
  limit: number;
  next: boolean;
  previous: boolean;
  total: number;
};

export type Period = {
  id: number;
  start_year: string;
  end_year: string;
};

export type Employee = {
  id: number;
  code: number;
  name: string;
  ein: string;
  position: string;
  positon_type: string;
  organizational_unit: string;
  work_unit: string;
  rank: string;
  group_class: string;
  sds_last_group: string;
  parent_agency: string;
  employee_type: string;
}

export type EligibleCheckReason = {
  unfulfilled_requirements: string[],
  missing_documents:string[]
}

export type EmployeePromotionCheck = {
  id: number;
  code: number;
  name: string;
  ein: string;
  position: string;
  positon_type: string;
  work_unit: string;
  rank: string;
  rank_id: string;
  group_class: string;
  sds_last_group: string;
  parent_agency: string;          
  is_eligible: boolean;
  reasons: EligibleCheckReason;
  expected_promotion_date: string;
  is_overdue: boolean;
}

export type EmployeePromotionCategories = {
  overdue_promotions: EmployeePromotionCheck[];
  due_soon_promotions: EmployeePromotionCheck[];
  upcoming_promotions: EmployeePromotionCheck[];
  this_year_promotion_count: Record<string, number>;
}

export type RegularPromotionCheckResult = {
  total_count: number;                        
  overdue_count: number;                         
  due_soon_count: number;                         
  upcoming_due_count: number;             
  eligible_count: number;            
  timestamp: string;                     
  regular_promotions: EmployeePromotionCategories; 
}

export type DocumentType = {
  id: number;
  code: string;
  name: string;
  category: string;
}

export type LegalDocument = {
  id: number;
  employee_id: number;
  document_type: DocumentType;
  url: string;
}

export type SignedURL = {
  signed_url: string;
  expired_at: string;
}

export interface DocumentPoolDrawerProps extends HTMLFormAttributes {
  open?: boolean;
  title?: string;
  data?: Record<string, unknown>;
  documents?: Array<Record<string, unknown>>;
  additionalFields?: AdditionalField[];
  prefilledUrls?: Record<string, string>;
}

export type EmployeePromotionStatus = 'overdue' | 'soon' | 'upcoming';

export interface PromotionWithCategory extends EmployeePromotionCheck {
  // Tipe ini menambahkan properti category ke tipe promosi yang sudah ada
  category: EmployeePromotionStatus; 
}

export type Rank = {
  id: number;
  name: string;
  group_class_id: number;
  group_class_name: string;
  group: string;
  class: string;
}

export type WorkUnit = {
  id: number;
  name: string;
  organizational_unit_id: number;
  organizational_unit_name: string;
}

export type OrganizationalUnit = {
  id: number;
  name: string;
  work_units: WorkUnit[];
}

export type TrafficData = {
  series: number[];
  labels: string[];
  colors: string[];
}

export type PerformanceDetail = {
  id: number;
  employee_id: number;
  document_id: number;
  document_type_id: number;
  performance_rating: string;
  credit_score: number;
  type: string;
  start_date: string;
  end_date: string;
}