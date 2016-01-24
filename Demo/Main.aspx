<%@ Page Language="C#" MasterPageFile="~/Content/Page.Master" %>
<script runat="server">

</script>
<asp:Content ContentPlaceHolderID="head" runat="server">
<script>
    console.log("script na header do main.aspx");
</script>
</asp:Content>
<asp:Content ContentPlaceHolderID="content" runat="server">

    <h2>Main Content</h2>
    <a href="Simple.aspx?p=john">Simple with QueryString</a>

</asp:Content>
