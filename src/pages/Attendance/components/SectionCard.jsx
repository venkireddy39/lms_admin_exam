const SectionCard = ({ title, icon: Icon, children, description }) => (
    <div className="col-md-6 col-xl-4 d-flex">
        <div className="card shadow-sm border-0 w-100 overflow-hidden">
            <div className="card-header bg-white py-3 border-bottom-0">
                <div className="d-flex align-items-center gap-2 mb-1">
                    <div className="p-2 bg-primary bg-opacity-10 rounded-circle text-primary">
                        <Icon size={18} />
                    </div>
                    <h6 className="mb-0 fw-bold text-dark">{title}</h6>
                </div>
                {description && (
                    <div className="text-muted small ps-1">{description}</div>
                )}
            </div>

            <div className="card-body pt-0">
                <div className="d-flex flex-column gap-3">
                    {children}
                </div>
            </div>
        </div>
    </div>
);

export default SectionCard;