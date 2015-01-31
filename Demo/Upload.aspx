<%@ Page Title="" Language="C#" MasterPageFile="~/Content/Page.Master" AutoEventWireup="true" %>
<script runat="server">

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
        }
    }

    protected void btn_Click(object sender, EventArgs e)
    {
        lbl.Text = "Total bytes uploaded: " + upl.PostedFile.ContentLength;
    }
    
</script>
<asp:Content ID="ctrContent" ContentPlaceHolderID="content" runat="server">

    <div>
        <asp:FileUpload runat="server" ID="upl" />
        <asp:Button runat="server" ID="btn" OnClick="btn_Click" Text="Upload" />
    </div>
    <asp:Label runat="server" ID="lbl" />

</asp:Content>
