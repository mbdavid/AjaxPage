<%@ Page Title="" Language="C#" MasterPageFile="~/Content/Page.Master" AutoEventWireup="true" %>
<script runat="server">

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            txt.Text = ">";
        }
    }

    protected void btn_Click(object sender, EventArgs e)
    {
        txt.Text = DateTime.Now.ToString();
    }
    
</script>
<asp:Content ID="ctrContent" ContentPlaceHolderID="content" runat="server">

    <asp:TextBox runat="server" ID="txt" />
    <asp:Button runat="server" ID="btn" OnClick="btn_Click" Text="Update" />

</asp:Content>
