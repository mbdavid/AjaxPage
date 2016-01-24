<%@ Page Language="C#" MasterPageFile="~/Content/Page.Master" %>
<script runat="server">

    protected void btn1_Click(object sender, EventArgs e)
    {
        Response.Redirect("Simple.aspx?p=fromRedirect");
    }

</script>
<asp:Content ID="ctrContent" ContentPlaceHolderID="content" runat="server">

    <asp:LinkButton runat="server" ID="btn1" Text="Response.Redirect" OnClick="btn1_Click" /><br />

</asp:Content>
