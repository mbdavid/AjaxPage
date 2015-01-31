<%@ Page Title="Start" Language="C#" MasterPageFile="~/Content/Page.Master" AutoEventWireup="true" %>
<script runat="server">

    protected void Page_Load(object sender, EventArgs e)
    {
    }

    protected void btn_Click(object sender, EventArgs e)
    {
        Title = "Changed to = " + DateTime.Now.Second.ToString();
    }

</script>
<asp:Content ID="ctrContent" ContentPlaceHolderID="content" runat="server">

    <asp:Button runat="server" ID="btn" OnClick="btn_Click" Text="Change Title" />

</asp:Content>
